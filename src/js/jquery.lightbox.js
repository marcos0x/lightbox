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
          imageTypes: ['jpg', 'jpeg', 'png', 'gif', 'tif', 'tiff', 'bmp'],
          videoTypes: ['mp4', 'webm', 'ogg', 'flv'],
          videoPoster: element.data('video-poster') || '',
          gallery: element.data('gallery') || false,
          title: element.data('title') || false,
          description: element.data('description') || false,
          content: element.data('content') || false,
          footer: element.data('footer') || false
      };

      _this.settings = $.extend(true, _this.defaults, settings);

      if(_this.settings.gallery.length){
        _this.settings.isGallery = true;
      } else {
        _this.settings.isGallery = false;
      }

      _this.setEvents();
      _this.setAction();
      _this.setType();
      _this.setBehavior();
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

      $(window).resize(function(){
        _this.setPosition();
      });

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

    _this.setType = function(){

      if(!_this.settings.type){

        var extension = _this.settings.href.indexOf('.') != -1 ? _this.settings.href.split('.').pop() : false;

        if(extension.length && $.inArray(extension, _this.settings.imageTypes) != -1){
          _this.settings.type = 'image';
        } else if(extension.length && $.inArray(extension, _this.settings.videoTypes) != -1){
          _this.settings.type = 'video';
        } else if(_this.settings.href.length && _this.settings.href.indexOf('http') > -1) {
          _this.settings.type = 'ajax';
        } else {
          _this.settings.type = 'inline';
        }

      }

      if(_this.settings.type == 'inline' && !_this.settings.content){
        _this.settings.content = _this.settings.href;
      }

    };

    _this.setPosition = function(param){
      var param = param || false;
      var wH = _this.isMobile && typeof document.documentElement.clientHeight != 'undefined' ? Math.max(document.documentElement.clientHeight, $(window).height()) : $(window).height();
      if(param == 'initial'){
        _this.settings.box.css('visibility', 'hidden');
        _this.settings.box.css('display', 'block');
      }
      _this.settings.box.find('.lightbox-body').css({'margin-top': ((wH - _this.settings.box.find('.lightbox-body').outerHeight())/2)+'px'});
      if(param == 'initial'){
        _this.settings.box.css('display', 'none');
        _this.settings.box.css('visibility', 'visible');
      }
    };

    _this.preloadImage = function(src, callback){

      var img = $('<img />')
      .attr('src', src)
      .load(function(){
        clearTimeout(_this.preloadShowLoadingTimer);
        var _img = this;
        if(typeof callback == 'function'){
          callback.call(undefined, _img);
        }
      });

    };

    _this.loadImage = function(imageSrc, callback){

      var src;

      if(_this.settings.isGallery){
        src = _this.gallery.items[imageSrc];
      } else {
        src = imageSrc;
      }

      var galleryActive = _this.settings.isGallery && (_this.gallery !== undefined && _this.gallery.items.length > 1);

      _this.preloadShowLoading = false;

      _this.preloadShowLoadingTimer = setTimeout(function(){

        _this.preloadShowLoading = true;

        _this.settings.box.find('.lightbox-body').css({'width': _this.settings.box.find('.lightbox-content').width()+'px', 'height': _this.settings.box.find('.lightbox-content').height()+'px'});
        _this.settings.box.find('.lightbox-content').addClass('loading').addClass('dark').html('');

      }, 200);

      _this.preloadImage(src, function(image){

        var w = image.width;
        var h = image.height;
        var wH = _this.isMobile && typeof document.documentElement.clientHeight != 'undefined' ? Math.max(document.documentElement.clientHeight, $(window).height()) : $(window).height();

        _this.settings.box.find('.lightbox-content').removeClass('loading').html(image);

        if(_this.settings.box.find('.lightbox-body').outerWidth() != w && _this.settings.box.find('.lightbox-body').css('marginTop') != ((wH - h)/2)){
          _this.settings.box.find('.lightbox-body').animate({'width': w+'px', 'margin-top': ((wH - h)/2)+'px'}, 300, _this.settings.easing);
        }

        if(galleryActive){
          if(_this.settings.box.find('.lightbox-prev').css('top') != ((h-_this.settings.box.find('.lightbox-prev').outerHeight())/2)){
            _this.settings.box.find('.lightbox-prev').animate({top: ((h-_this.settings.box.find('.lightbox-prev').outerHeight())/2)+'px'}, 300, _this.settings.easing);
          }
          if(_this.settings.box.find('.lightbox-next').css('top') != ((h-_this.settings.box.find('.lightbox-next').outerHeight())/2)){
            _this.settings.box.find('.lightbox-next').animate({top: ((h-_this.settings.box.find('.lightbox-next').outerHeight())/2)+'px'}, 300, _this.settings.easing);
          }
        }

        if(typeof callback == 'function'){
          callback.call(undefined, image, w, h);
        }
      });

    };

    _this.loadVideo = function(videoSrc, callback){

      var src;

      if(_this.settings.isGallery){
        src = _this.gallery.items[videoSrc];
      } else {
        src = videoSrc;
      }

      var extension = src.indexOf('.') != -1 ? src.split('.').pop() : false;

      var galleryActive = _this.settings.isGallery && (_this.gallery !== undefined && _this.gallery.items.length > 1);

      var w = _this.settings.width || 640;
      var h = _this.settings.height || 480;
      var wH = _this.isMobile && typeof document.documentElement.clientHeight != 'undefined' ? Math.max(document.documentElement.clientHeight, $(window).height()) : $(window).height();
      var type = 'flash';

      if(src.indexOf('youtube') > -1) {
        src = src.replace('watch?v=', 'embed/');
        type = 'iframe';
      } else if(src.indexOf('vimeo') > -1) {
        src = src.replace('www.', '');
        src = src.replace('vimeo.com/', 'player.vimeo.com/video/');
        type = 'iframe';
      }

      var video = $('<div class="lightbox-video" style="width:'+w+'px; height:'+h+'px; overflow:hidden;"><object id="lightbox-video" width="'+w+'" height="'+h+'" type="application/x-shockwave-flash" data="http://releases.flowplayer.org/swf/flowplayer-3.2.18.swf"></div>');

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

      if(_this.settings.box.find('.lightbox-body').outerWidth() != w && _this.settings.box.find('.lightbox-body').css('marginTop') != ((wH - h)/2)){
        _this.settings.box.find('.lightbox-body').animate({'width': w+'px', 'margin-top': ((wH - h)/2)+'px'}, 300, _this.settings.easing);
      }

      if(galleryActive){
        if(parseInt(_this.settings.box.find('.lightbox-prev').css('top'), 10) != ((h-_this.settings.box.find('.lightbox-prev').outerHeight())/2)){
          _this.settings.box.find('.lightbox-prev').animate({top: ((h-_this.settings.box.find('.lightbox-prev').outerHeight())/2)+'px'}, 300, _this.settings.easing);
        }
        if(parseInt(_this.settings.box.find('.lightbox-next').css('top'), 10) != ((h-_this.settings.box.find('.lightbox-next').outerHeight())/2)){
          _this.settings.box.find('.lightbox-next').animate({top: ((h-_this.settings.box.find('.lightbox-next').outerHeight())/2)+'px'}, 300, _this.settings.easing);
        }
      }

      if(typeof callback == 'function'){
        callback.call(undefined, video, w, h);
      }

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

    _this.setView = function(){

      if(_this.settings.isGallery){

        _this.gallery = {
          items: [],
          loaded: [],
          current: 0
        };

        switch(_this.settings.type){
          case 'image':
            _this.settings.box.addClass('is-image');
          break;
          case 'video':
            _this.settings.box.addClass('is-video');
          break;
        }

        _this.settings.box.addClass('is-gallery');
        _this.settings.box.find('.lightbox-header').hide();
        _this.settings.box.find('.lightbox-footer').hide();
        _this.settings.box.find('.lightbox-content').addClass('loading').html('');
        _this.settings.box.find('.lightbox-prev').hide();
        _this.settings.box.find('.lightbox-next').hide();

        $.each($('a', $(_this.settings.gallery)), function(){
          var href = $(this).attr('href');
          switch(_this.settings.type){
            case 'image':
              if(href.length && $.inArray(href.split('.').pop(), _this.settings.imageTypes) != -1){
                _this.gallery.items.push(href);
              }
            break;
            case 'video':
              if(href.length && $.inArray(href.split('.').pop(), _this.settings.videoTypes) != -1){
                _this.gallery.items.push(href);
              }
            break;
          }
        });

        if(!_this.gallery.items.length){
          _this.settings.gallery = false;
          return _this.setView();
        }

        for(var i in _this.gallery.items){
          if(_this.settings.href == _this.gallery.items[i]){
            _this.gallery.current = parseInt(i, 10);
            break;
          }
        }

        switch(_this.settings.type){
          case 'image':
            _this.loadImage(_this.gallery.current);
          break;
          case 'video':
            _this.loadVideo(_this.gallery.current);
          break;
        }

        if(_this.gallery.items.length > 1){
          _this.settings.box.find('.lightbox-prev').show();
          _this.settings.box.find('.lightbox-next').show();
        }

        _this.settings.box.find('.lightbox-prev a').off('click').click(function(){
          _this.gallery.current -= 1;
          if(_this.gallery.current == -1){
            _this.gallery.current = _this.gallery.items.length - 1;
          }
          switch(_this.settings.type){
            case 'image':
              _this.loadImage(_this.gallery.current);
            break;
            case 'video':
              _this.loadVideo(_this.gallery.current);
            break;
          }
          return false;
        });

        _this.settings.box.find('.lightbox-next a').off('click').click(function(){
          _this.gallery.current += 1;
          if(_this.gallery.current > _this.gallery.items.length - 1){
            _this.gallery.current = 0;
          }
          switch(_this.settings.type){
            case 'image':
              _this.loadImage(_this.gallery.current);
            break;
            case 'video':
              _this.loadVideo(_this.gallery.current);
            break;
          }
          return false;
        });

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
