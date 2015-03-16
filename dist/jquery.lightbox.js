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
          imageTypes: ['jpg', 'jpeg', 'png', 'gif', 'tif', 'tiff', 'bmp'],
          classes: element.data('class') || false,
          title: element.data('title') || false,
          action: element.data('action') || false,
          type: element.data('type') || false,
          description: element.data('description') || false,
          content: element.data('content') || false,
          footer: element.data('footer') || false,
          gallery: element.data('gallery') || false,
          behavior: element.data('behavior') || 'default'
      };

      _this.settings = $.extend(true, _this.defaults, settings);

      _this.setEvents();
      _this.setAction();
      _this.setType();
      _this.setBehavior();
      _this.setView();

      if((_this.settings.type == 'image' || _this.settings.type == 'gallery') && _this.isMobile){
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

      if(_this.settings.gallery.length){
        _this.settings.type = 'gallery';
      }

      if(!_this.settings.type){

        var extension = _this.settings.href.indexOf('.') != -1 ? _this.settings.href.split('.').pop() : false;

        if(extension.length && $.inArray(extension, _this.settings.imageTypes) != -1){
          _this.settings.type = 'image';
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

    _this.loadImage = function(image, callback){

      var src;

      if(_this.settings.type == 'gallery'){
        src = _this.gallery.items[image];
      } else {
        src = image;
      }

      var galleryActive = _this.settings.type == 'gallery' && (_this.gallery !== undefined && _this.gallery.items.length > 1);

      _this.preloadShowLoading = false;

      _this.preloadShowLoadingTimer = setTimeout(function(){

        _this.preloadShowLoading = true;

        _this.settings.box.find('.lightbox-body').css({'width': _this.settings.box.find('.lightbox-content').width()+'px', 'height': _this.settings.box.find('.lightbox-content').height()+'px'});
        _this.settings.box.find('.lightbox-content').addClass('loading').addClass('dark').html('');

      }, 200);

      _this.preloadImage(src, function(img){

        var w = img.width;
        var h = img.height;
        var wH = _this.isMobile && typeof document.documentElement.clientHeight != 'undefined' ? Math.max(document.documentElement.clientHeight, $(window).height()) : $(window).height();

        _this.settings.box.find('.lightbox-content').removeClass('loading').html(img);

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
          callback.call(undefined, img, w, h);
        }
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

    _this.setView = function(){

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
        case 'gallery':

          _this.gallery = {
            items: [],
            loaded: [],
            current: 0
          };

          _this.settings.box.addClass('is-image');
          _this.settings.box.addClass('is-gallery');
          _this.settings.box.find('.lightbox-header').hide();
          _this.settings.box.find('.lightbox-footer').hide();
          _this.settings.box.find('.lightbox-content').addClass('loading').html('');
          _this.settings.box.find('.lightbox-prev').hide();
          _this.settings.box.find('.lightbox-next').hide();

          $.each($('a', $(_this.settings.gallery)), function(){
            var e = $(this);
            if(e.attr('href').length && $.inArray(e.attr('href').split('.').pop(), _this.settings.imageTypes) != -1){
              _this.gallery.items.push(e.attr('href'));
            }
          });

          if(!_this.gallery.items.length){
            _this.settings.gallery = false;
            _this.settings.type = 'image';
            return _this.setView();
          }

          for(var i in _this.gallery.items){
            if(_this.settings.href == _this.gallery.items[i]){
              _this.gallery.current = parseInt(i);
              break;
            }
          }

          _this.loadImage(_this.gallery.current);

          if(_this.gallery.items.length > 1){
            _this.settings.box.find('.lightbox-prev').show();
            _this.settings.box.find('.lightbox-next').show();
          }

          _this.settings.box.find('.lightbox-prev a').off('click').click(function(){
            _this.gallery.current -= 1;
            if(_this.gallery.current == -1){
              _this.gallery.current = _this.gallery.items.length - 1;
            }
            _this.loadImage(_this.gallery.current);
            return false;
          });

          _this.settings.box.find('.lightbox-next a').off('click').click(function(){
            _this.gallery.current += 1;
            if(_this.gallery.current > _this.gallery.items.length - 1){
              _this.gallery.current = 0;
            }
            _this.loadImage(_this.gallery.current);
            return false;
          });

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
