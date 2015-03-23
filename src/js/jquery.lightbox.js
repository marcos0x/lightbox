(function(global, $){

  'use strict';

  function Lightbox(){
    var _this = this;
    _this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    _this.init = function(element, settings){
      _this.defaults = {
          box: $('<div class="lightbox-main" id="lightbox" style="display:none"><div class="lightbox-overlay"></div><div class="lightbox-wrapper"><div class="lightbox-body"><div class="lightbox-close"><a href="#">&times;</a></div><div class="lightbox-prev" style="display:none;"><a href="#"><i></i></a></div><div class="lightbox-next" style="display:none;"><a href="#"><i></i></a></div><div class="lightbox-header cf"></div><div class="lightbox-content cf"></div><div class="lightbox-footer cf"></div></div></div></div>'),
          easing: typeof jQuery.ui != 'undefined' ? 'easeOutCubic' : false,
          texts: typeof app !== 'undefined' && app.data !== 'undefined' && app.data.texts !== 'undefined' ? app.data.texts : {
            loading: 'Cargando...',
            error: 'Ha ocurrido un error',
            accept: 'Aceptar',
            cancel: 'Cancelar',
            deletes: {
              title: '¿Seguro que desea eliminar?',
              description_list: 'Esta acción eliminará los elementos seleccionados y no se puede deshacer.',
              description_single: 'Esta acción no se puede deshacer.'
            },
            select: {
              title: 'Debe seleccionar un elemento',
              description: 'Para realizar la acción solicitada debe tener al menos un elemento seleccionado.'
            }
          },
          href: element.attr('href') || false,
          behavior: element.data('behavior') || 'default',
          type: element.data('type') || false,
          action: element.data('action') || false,
          classes: element.data('class') || false,
          width: element.data('width') || false,
          height: element.data('height') || false,
          types: {
            image: ['jpg', 'jpeg', 'png', 'gif', 'tif', 'tiff', 'bmp'],
            video: ['mp4', 'webm', 'ogg', 'flv']
          },
          videoPoster: element.data('video-poster') || '',
          gallery: element.data('gallery') || false,
          title: element.data('title') || false,
          description: element.data('description') || false,
          content: element.data('content') || false,
          footer: element.data('footer') || false
      };

      _this.settings = $.extend(true, _this.defaults, settings);

      _this.setEvents();
      _this.setBehavior();
      _this.setAction();
      _this.setType();
      _this.setView();

      if((_this.settings.type == 'image' || _this.settings.type == 'video' || typeof _this.settings.gallery != 'undefined') && _this.isMobile){
        var _width = typeof document.documentElement.clientWidth != 'undefined' ? Math.max(document.documentElement.clientWidth, $(window).width()) : $(window).width();
        if (_width < 480) {
          _this.cancel(element);
          return false;
        }
      }

      return true;
    };

    _this.windowWidth = function(){
      return _this.isMobile && typeof document.documentElement.clientWidth != 'undefined' ? Math.max(document.documentElement.clientWidth, $(window).width()) : $(window).width();
    };

    _this.windowHeight = function(){
      return _this.isMobile && typeof document.documentElement.clientHeight != 'undefined' ? Math.max(document.documentElement.clientHeight, $(window).height()) : $(window).height();
    };

    _this.setEvents = function(){
      $(document).on('click', '.lightbox-close, .lightbox-main a[data-dismiss="modal"], .lightbox-main a[data-dismiss="lightbox"]', function(){
        _this.close();
        return false;
      });

      $(document).on('click', '.lightbox-delete-multiple', function(){
        _this.close();
        var form = $(element.attr('data-form'));
        form.attr('action', form.attr('action').replace('index', 'delete'));
        form.submit();
        return false;
      });

      _this.settings.box.find('.lightbox-prev a').off('click').click(function(){
        _this.loadItemGalleryPrev();
        return false;
      });

      _this.settings.box.find('.lightbox-next a').off('click').click(function(){
        _this.loadItemGalleryNext();
        return false;
      });

      $(window).resize(function(){
        _this.setPosition();
      });
    };

    _this.setBehavior = function(){
      switch(_this.settings.behavior){
        case 'modal':
          _this.settings.box.addClass('is-modal');
        break;
        default:
          _this.settings.box.find('.lightbox-wrapper').click(function(e) { 
            if(e.target !== this){
              return;
            }
            _this.close();
            return false;
          });
        break;
      }
    };

    _this.setAction = function(){
      switch(_this.settings.action){
        case 'delete':
          _this.settings.title = _this.settings.title.length ? _this.settings.title : _this.settings.texts.deletes.title;
          _this.settings.content = _this.settings.description.length ? _this.settings.description : '<p>'+_this.settings.texts.deletes.description_single+'</p>';
          _this.settings.footer = '<a data-dismiss="lightbox" href="#" class="btn btn-default">'+_this.settings.texts.cancel+'</a>';
          _this.settings.footer += '<a href="'+_this.settings.href+'" class="btn btn-primary">'+_this.settings.texts.accept+'</a>';
          _this.settings.behavior = 'modal';
          _this.settings.type = 'inline';
        break;
        case 'delete-multiple':
          _this.settings.title = _this.settings.title.length ? _this.settings.title : _this.settings.texts.deletes.title;
          _this.settings.content = _this.settings.description.length ? _this.settings.description : '<p>'+_this.settings.texts.deletes.description_list+'</p>';
          _this.settings.footer = '<a data-dismiss="lightbox" href="#" class="btn btn-default">'+_this.settings.texts.cancel+'</a>';
          _this.settings.footer += '<a href="#" class="btn btn-primary lightbox-delete-multiple">'+_this.settings.texts.accept+'</a>';
          _this.settings.behavior = 'modal';
          _this.settings.type = 'inline';
        break;
      }
    };

    _this.checkType = function(type, src){
      if(typeof type !== 'string' || typeof src !== 'string'){
        return false;
      }
      switch(type){
        case 'image':
        case 'video':
          var extension = src.indexOf('.') > -1 ? src.split('.').pop() : false;
          if(extension.length && $.inArray(extension, _this.settings.types[type]) != -1){
            return true;
          }
        break;
        case 'ajax':
          if(src.indexOf('http') > -1){
            return true;
          }
        break;
      }
      return false;
    };

    _this.setType = function(src){
      var src = src || _this.settings.href;

      if(!_this.settings.type){
        if(_this.checkType('image', src)){
          _this.settings.type = 'image';
        } else if(_this.checkType('video', src)){
          _this.settings.type = 'video';
        } else if(_this.checkType('ajax', src)) {
          _this.settings.type = 'ajax';
        } else {
          _this.settings.type = 'inline';
        }
      }

      if(_this.settings.type == 'inline' && !_this.settings.content){
        _this.settings.content = src;
      }
    };

    _this.setView = function(){
      if(_this.settings.gallery.length){
        _this.settings.isGallery = true;
      } else {
        _this.settings.isGallery = false;
      }

      if(_this.settings.isGallery){
        _this.loadGallery();
      } else {
        if(_this.settings.title.length){
          _this.settings.box.find('.lightbox-header').html(_this.settings.title);
        } else {
            _this.settings.box.find('.lightbox-header').hide();
        }

        if(_this.settings.footer.length){
          _this.settings.box.find('.lightbox-footer').html(_this.settings.footer);
        } else {
          _this.settings.box.find('.lightbox-footer').hide();
        }

        switch(_this.settings.type){
          case 'inline':
            if($(_this.settings.content).length){
              var _content = $(_this.settings.content).clone(true);
              _this.settings.box.find('.lightbox-content').html(_content);
            } else {
              _this.settings.box.find('.lightbox-content').html(_this.settings.content);
            }
          break;
          case 'image':
            _this.settings.box.addClass('is-image');
            _this.settings.box.find('.lightbox-header').hide();
            _this.settings.box.find('.lightbox-footer').hide();
            _this.settings.box.find('.lightbox-content').addClass('loading');
            _this.loadImage(_this.settings.href);
          break;
          case 'video':
            _this.settings.box.addClass('is-video');
            _this.settings.box.find('.lightbox-header').hide();
            _this.settings.box.find('.lightbox-footer').hide();
            _this.settings.box.find('.lightbox-content').addClass('loading');
            _this.loadVideo(_this.settings.href);
          break;
          case 'ajax':
            $.ajax({
              url: _this.settings.href,
              success: function(response){
                _this.settings.box.find('.lightbox-content').html(response);
              }
            });
          break;
          case 'iframe':
            _this.settings.box.find('.lightbox-content').html('<iframe src="'+_this.settings.href+'" border="0"></iframe>');
          break;
        }
      }
    };

    _this.loadGallery = function(){
      _this.gallery = {
        items: [],
        current: 0
      };

      $.each($('a', $(_this.settings.gallery)), function(){
        var src = $(this).attr('href');
        if(typeof src !== 'undefined'){
          if(_this.checkType('image', src)){
            _this.gallery.items.push(src);
          } else if(_this.checkType('video', src)){
            _this.gallery.items.push(src);
          }
        }
      });

      if(_this.gallery.items.length <= 1){
        _this.settings.gallery = false;
        _this.settings.isGallery = false;
        return _this.setView();
      }

      _this.settings.box.addClass('is-gallery');
      _this.settings.box.addClass('is-'+_this.settings.type);
      _this.settings.box.find('.lightbox-header').hide();
      _this.settings.box.find('.lightbox-footer').hide();
      _this.settings.box.find('.lightbox-content').addClass('loading').html('');
      _this.settings.box.find('.lightbox-prev').hide();
      _this.settings.box.find('.lightbox-next').hide();

      for(var i in _this.gallery.items){
        if(_this.settings.href == _this.gallery.items[i]){
          _this.gallery.current = parseInt(i, 10);
          break;
        }
      }

      _this.loadItemGallery(_this.gallery.items[_this.gallery.current]);

      if(_this.gallery.items.length > 1){
        _this.settings.box.find('.lightbox-prev').show();
        _this.settings.box.find('.lightbox-next').show();
      }
    };

    _this.loadItemGalleryPrev = function(){
      _this.gallery.current -= 1;
      if(_this.gallery.current == -1){
        _this.gallery.current = _this.gallery.items.length - 1;
      }
      _this.loadItemGallery(_this.gallery.items[_this.gallery.current]);
    }

    _this.loadItemGalleryNext = function(){
      _this.gallery.current += 1;
      if(_this.gallery.current > _this.gallery.items.length - 1){
        _this.gallery.current = 0;
      }
      _this.loadItemGallery(_this.gallery.items[_this.gallery.current]);
    }

    _this.loadItemGallery = function(src){
      _this.setType(src);
      if(_this.checkType('image', src)){
        _this.loadImage(src);
      } else if(_this.checkType('video', src)){
        _this.loadVideo(src);
      }
    };

    _this.preloadImage = function(src, callback){
      var img = $('<img />')
      .attr('src', src)
      .load(function(){
        clearTimeout(_this.preloadShowLoadingTimer);
        var image = this;
        if(typeof callback == 'function'){
          callback(image);
        }
      });
    };

    _this.loadImage = function(src, callback){

      _this.preloadShowLoading = false;

      _this.preloadShowLoadingTimer = setTimeout(function(){
        _this.preloadShowLoading = true;
        _this.settings.box.find('.lightbox-body').css({'width': _this.settings.box.find('.lightbox-content').width()+'px', 'height': _this.settings.box.find('.lightbox-content').height()+'px'});
        _this.settings.box.find('.lightbox-content').addClass('loading').addClass('dark').html('');
      }, 200);

      _this.preloadImage(src, function(image){
        var w = image.width;
        var h = image.height;

        _this.setSize(w, h);
        _this.settings.box.find('.lightbox-content').removeClass('loading').html(image);

        if(typeof callback == 'function'){
          callback(image, w, h);
        }
      });
    };

    _this.loadVideo = function(src, callback){

      var w = _this.settings.width || 640;
      var h = _this.settings.height || 480;
      var type = 'flash';

      if(src.indexOf('youtube') > -1) {
        src = src.replace('watch?v=', 'embed/');
        type = 'iframe';
      } else if(src.indexOf('vimeo') > -1) {
        src = src.replace('www.', '');
        src = src.replace('vimeo.com/', 'player.vimeo.com/video/');
        type = 'iframe';
      }

      var video = $('<div class="lightbox-video" style="width:'+w+'px; height:'+h+'px; overflow:hidden;"></div>');

      switch(type) {
        case 'flash':
          var videoPlayer = $('<object id="lightbox-video" width="'+w+'" height="'+h+'" type="application/x-shockwave-flash" data="http://releases.flowplayer.org/swf/flowplayer-3.2.18.swf">'+
          '<param name="movie" value="http://releases.flowplayer.org/swf/flowplayer-3.2.18.swf">'+
          '<param name="allowfullscreen" value="true">'+
          '<param value="true" name="allowfullscreen">'+
          '<param value="always" name="allowscriptaccess">'+
          '<param value="high" name="quality">'+
          '<param value="#000000" name="bgcolor">'+
          '<param  name="flashvars" value=\'config={"clip":{"autoPlay":false,"autoBuffering":true,"baseUrl":"'+(src.split('/').slice(0,-1).join('/'))+'/","url":"'+(src.split('/').slice(-1).join(''))+'"},"playerId":"lightbox-video","playlist":[{"autoPlay":false,"autoBuffering":true,"baseUrl":"'+(src.split('/').slice(0,-1).join('/'))+'/","url":"'+(src.split('/').slice(-1).join(''))+'"}]}\'>'+
          '</object>');
          w += 2;
        break;
        case 'iframe':
          var videoPlayer = '<iframe id="lightbox-video" width="100%" height="100%" src="'+src+'"></iframe>';
        break;
      }

      video.html(videoPlayer);
      _this.settings.box.find('.lightbox-content').removeClass('loading').html(video);
      _this.setSize(w, h);

      if(typeof callback == 'function'){
        callback(video, w, h);
      }
    };

    _this.setSize = function(width, height, animate){
      _this.settings.newWidth = width || _this.settings.newWidth;
      _this.settings.newHeight = height || _this.settings.newHeight;
      var content = _this.settings.box.find('.lightbox-body');
      var contentWidth = content.outerWidth();
      var contentHeight = content.outerHeight();
      var contentMarginTop = content.css('marginTop');

      if(_this.windowHeight() < _this.settings.newHeight){
        var newHeight = _this.windowHeight() - 20;
        var newWidth = (newHeight * _this.settings.newWidth) / _this.settings.newHeight;
        var newMarginTop = (_this.windowHeight() - newHeight) / 2;
      } else {
        var newHeight = _this.settings.newHeight;
        var newWidth = _this.settings.newWidth;
        var newMarginTop = (_this.windowHeight() - _this.settings.newHeight) / 2;
      }

      if(contentMarginTop != newMarginTop){
        if(typeof animate !== 'undefined' && !animate){
          content.css({
            'margin-top': newMarginTop+'px'
          });
        } else {
          content.animate({
            'margin-top': newMarginTop+'px'
          }, {duration: 300, queue: false, easing: _this.settings.easing});
        }
      }

      if(contentWidth != newWidth){
        if(typeof animate !== 'undefined' && !animate){
          content.css({
            'width': newWidth +'px'
          });
        } else {
          content.animate({
            'width': newWidth +'px'
          }, {duration: 300, queue: false, easing: _this.settings.easing});
        }
      }

      if(_this.settings.isGallery){
        var prev = _this.settings.box.find('.lightbox-prev');
        var next = _this.settings.box.find('.lightbox-next');
        var newTop = (newHeight - prev.outerHeight()) / 2;
        if(prev.css('top') != newTop || next.css('top') != newTop){
          if(typeof animate !== 'undefined' && !animate){
            prev.css({
              top: newTop+'px'
            });
            next.css({
              top: newTop+'px'
            });
          } else {
            prev.animate({
              top: newTop+'px'
            }, {duration: 300, queue: false, easing: _this.settings.easing});
            next.animate({
              top: newTop+'px'
            }, {duration: 300, queue: false, easing: _this.settings.easing});
          }
        }
      }
    }

    _this.setPosition = function(param){
      var param = param || false;
      if(param == 'initial'){
        _this.settings.box.css('visibility', 'hidden');
        _this.settings.box.css('display', 'block');
        var content = _this.settings.box.find('.lightbox-body');
        content.css({'margin-top': ((_this.windowHeight() - content.outerHeight())/2)+'px'});
        _this.settings.box.css('display', 'none');
        _this.settings.box.css('visibility', 'visible');
      } else {
        _this.setSize(false, false, false);
      }
    };

    _this.bind = function(element, settings){
      element.off('click').click(function(){
        var init = _this.init(element, settings);
        if(init){
          _this.open();
          return false;
        }
      });
    };

    _this.cancel = function(element){
      element.attr('target', '_blank');
    };

    _this.open = function(){
      $('html,body').addClass('no-scroll');
      $('body').append(_this.settings.box);
      if(_this.settings.classes){
        _this.settings.box.addClass(_this.settings.classes);
      }
      _this.setPosition('initial');
      _this.settings.box.fadeIn(450);
    };

    _this.close = function(){
      $('html,body').removeClass('no-scroll');
      _this.settings.box.fadeOut(450, function(){
        _this.settings.box.remove();
      });
    };
  }

  global.lightbox = new Lightbox();

  $.fn.extend({
    lightbox: function(params) {
      var settings = params || {};

      return this.each(function(){
        var element = $(this);

        switch(settings){
          default:
          case 'bind':
            global.lightbox.bind(element, settings);
          break;
          case 'close':
            global.lightbox.close();
          break;
        }
      });
    }
  });

})(window, jQuery);
