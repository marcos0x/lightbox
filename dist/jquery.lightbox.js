(function(global, $) {
  'use strict';

  function Lightbox() {
    var _this = this;
    _this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    _this.init = function(element, settings) {
      _this.defaults = {
        box: $('<div class="lightbox-main" id="lightbox" style="display:none"><div class="lightbox-overlay"></div><div class="lightbox-wrapper"><div class="lightbox-body"><div class="lightbox-close"><a href="#">&times;</a></div><div class="lightbox-prev" style="display:none;"><a href="#"><i></i></a></div><div class="lightbox-next" style="display:none;"><a href="#"><i></i></a></div><div class="lightbox-header cf"></div><div class="lightbox-content cf"></div><div class="lightbox-footer cf"></div></div></div></div>'),
        easing: typeof jQuery.ui != 'undefined' ? 'easeOutCubic' : false,
        texts: typeof app !== 'undefined' && typeof app.data !== 'undefined' && typeof app.data.texts !== 'undefined' ? app.data.texts : {
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
        open: element.attr('data-open') || false,
        href: element.attr('href') || false,
        async: element.attr('async') || false,
        animate: element.attr('data-animate') || false,
        behavior: element.attr('data-behavior') || 'default',
        type: element.attr('data-type') || false,
        action: element.attr('data-action') || false,
        classes: element.attr('data-class') || false,
        width: element.attr('data-width') || false,
        height: element.attr('data-height') || false,
        types: {
          image: ['jpg', 'jpeg', 'png', 'gif', 'tif', 'tiff', 'bmp'],
          video: ['mp4', 'webm', 'ogg', 'flv']
        },
        videoPoster: element.attr('data-video-poster') || '',
        videoFormat: element.attr('data-video-format') || 'html5',
        gallery: element.attr('data-gallery') || false,
        title: element.attr('data-title') || false,
        description: element.attr('data-description') || false,
        content: element.attr('data-content') || false,
        footer: element.attr('data-footer') || false,
        documentBody: {
          position: $('body').css('position'),
          overflow: $('body').css('overflow')
        },
        complete: false
      };

      _this.settings = $.extend(true, _this.defaults, settings);
      _this.lightbox = _this.settings.box;

      _this.setEvents();
      _this.setAction();
      _this.setBehavior();
      _this.setType();
      _this.setView();

      if ((_this.settings.type == 'image' || _this.settings.type == 'video' || typeof _this.settings.gallery != 'undefined') && _this.isMobile) {
        var _width = typeof document.documentElement.clientWidth != 'undefined' ? Math.max(document.documentElement.clientWidth, $(window).width()) : $(window).width();
        if (_width < 480) {
          _this.cancel(element);
          return false;
        }
      }

      if (_this.settings.open) {
        _this.open();
      }

      return true;
    };

    _this.windowWidth = function() {
      return _this.isMobile && typeof document.documentElement.clientWidth != 'undefined' ? Math.max(document.documentElement.clientWidth, $(window).width()) : $(window).width();
    };

    _this.windowHeight = function() {
      return _this.isMobile && typeof document.documentElement.clientHeight != 'undefined' ? Math.max(document.documentElement.clientHeight, $(window).height()) : $(window).height();
    };

    _this.setEvents = function() {
      $(document).on('click', '.lightbox-close, .lightbox-main a[data-dismiss="modal"], .lightbox-main a[data-dismiss="lightbox"]', function() {
        _this.close();
        return false;
      });

      $(document).on('click', '.lightbox-delete-multiple', function() {
        _this.close();
        var form = $(element.attr('data-form'));
        form.attr('action', form.attr('action').replace('index', 'delete'));
        form.submit();
        return false;
      });

      _this.lightbox.find('.lightbox-prev a').off('click').click(function() {
        _this.loadItemGalleryPrev();
        return false;
      });

      _this.lightbox.find('.lightbox-next a').off('click').click(function() {
        _this.loadItemGalleryNext();
        return false;
      });

      $(window).resize(function() {
        _this.setPosition('update');
      });
    };

    _this.setAction = function() {
      switch (_this.settings.action) {
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

    _this.setBehavior = function() {
      switch (_this.settings.behavior) {
        case 'modal':
          _this.lightbox.addClass('is-modal');
        break;
        default:
          _this.lightbox.find('.lightbox-wrapper').click(function(e) { 
            if (e.target !== this) {
              return;
            }
            _this.close();
            return false;
          });
        break;
      }
    };

    _this.checkType = function(type, src) {
      if (typeof type !== 'string' || typeof src !== 'string') {
        return false;
      }

      switch (type) {
        case 'image':
        case 'video':
          var src = src.split('?')[0];
          var extension = src.indexOf('.') > -1 ? src.split('.').pop() : false;

          if (extension.length && $.inArray(extension, _this.settings.types[type]) != -1) {
            return true;
          }
        break;
      }

      return false;
    };

    _this.setType = function(src) {
      var src = src || _this.settings.href;

      if (!_this.settings.type) {
        if (_this.checkType('image', src)) {
          _this.settings.type = 'image';
        } else if (_this.checkType('video', src)) {
          _this.settings.type = 'video';
        } else {
          _this.settings.type = 'inline';
        }
      }

      if (_this.settings.type == 'inline' && !_this.settings.content) {
        _this.settings.content = src;
      }
    };

    _this.setView = function() {
      if (_this.settings.gallery.length) {
        _this.settings.isGallery = true;
      } else {
        _this.settings.isGallery = false;
      }

      if (_this.settings.isGallery) {
        _this.loadGallery();
      } else {
        if (_this.settings.title.length) {
          _this.lightbox.find('.lightbox-header').html(_this.settings.title);
        } else {
          _this.lightbox.find('.lightbox-header').hide();
        }

        if (_this.settings.footer.length) {
          _this.lightbox.find('.lightbox-footer').html(_this.settings.footer);
        } else {
          _this.lightbox.find('.lightbox-footer').hide();
        }

        switch (_this.settings.type) {
          case 'inline':
            if ($(_this.settings.content).length) {
              _this.settings.contentElement = $(_this.settings.content).clone(true);
              $(_this.settings.content).wrap('<div class="lightbox-content-clone" style="display:none"></div>');
              $(_this.settings.content).remove();
              _this.lightbox.find('.lightbox-content').html(_this.settings.contentElement);
            } else {
              _this.lightbox.find('.lightbox-content').html(_this.settings.content);
            }
          break;
          case 'image':
            _this.lightbox
              .addClass('is-loading')
              .find('.lightbox-header, .lightbox-footer')
              .hide();
            _this.lightbox.find('.lightbox-content').addClass('loading');
            _this.loadImage(_this.settings.href);
          break;
          case 'video':
            _this.lightbox
              .addClass('is-loading')
              .find('.lightbox-header, .lightbox-footer')
              .hide();
            _this.lightbox.find('.lightbox-content').addClass('loading');
            _this.loadVideo(_this.settings.href);
          break;
          case 'ajax':
            _this.lightbox
              .addClass('is-ajax is-loading')
              .removeClass('is-image is-inline is-video')
              .find('.lightbox-content').addClass('loading');

            var ajaxParams = {
              url: _this.settings.href
            };

            if (_this.settings.async) {
              ajaxParams.async = true;
            }

            $.ajax(ajaxParams).done(function(response) {
              _this.lightbox
                .removeClass('is-loading')
                .find('.lightbox-content')
                  .removeClass('loading')
                  .html(response);

              if (typeof _this.settings.complete == 'function') {
                _this.settings.complete.call(undefined);
              }

              setTimeout(function() {
                _this.setPosition('update');
              }, 350);
            });
          break;
          case 'iframe':
            _this.lightbox.find('.lightbox-content').html('<iframe src="'+_this.settings.href+'" border="0"></iframe>');
          break;
        }
      }
    };

    _this.loadGallery = function() {
      _this.gallery = {
        items: [],
        current: 0
      };

      var objs = $(_this.settings.gallery).find('a');
      for (var i=0; i < objs.length; i++) {
        var obj = objs.eq(i);
        var src = obj.attr('href');
        if (typeof src !== 'undefined') {
          if (_this.checkType('image', src)) {
            _this.gallery.items.push(src);
          } else if (_this.checkType('video', src)) {
            _this.gallery.items.push(src);
          }
        }
      }

      if (_this.gallery.items.length <= 1) {
        _this.settings.gallery = false;
        _this.settings.isGallery = false;
        return _this.setView();
      }

      _this.lightbox.addClass('is-gallery is-loading is-'+_this.settings.type);
      _this.lightbox.find('.lightbox-header').hide();
      _this.lightbox.find('.lightbox-footer').hide();
      _this.lightbox.find('.lightbox-prev').hide();
      _this.lightbox.find('.lightbox-next').hide();
      _this.lightbox
        .find('.lightbox-content')
        .addClass('loading')
        .html('');

      for (var i in _this.gallery.items) {
        if (_this.settings.href == _this.gallery.items[i]) {
          _this.gallery.current = parseInt(i, 10);
          break;
        }
      }

      _this.loadItemGallery(_this.gallery.items[_this.gallery.current]);

      if (_this.gallery.items.length > 1) {
        _this.lightbox.find('.lightbox-prev').show();
        _this.lightbox.find('.lightbox-next').show();
      }
    };

    _this.loadItemGalleryPrev = function() {
      _this.gallery.current -= 1;

      if (_this.gallery.current == -1) {
        _this.gallery.current = _this.gallery.items.length - 1;
      }

      _this.loadItemGallery(_this.gallery.items[_this.gallery.current]);
    }

    _this.loadItemGalleryNext = function() {
      _this.gallery.current += 1;

      if (_this.gallery.current > _this.gallery.items.length - 1) {
        _this.gallery.current = 0;
      }

      _this.loadItemGallery(_this.gallery.items[_this.gallery.current]);
    }

    _this.loadItemGallery = function(src) {
      _this.setType(src);

      if (_this.checkType('image', src)) {
        _this.loadImage(src);
      } else if (_this.checkType('video', src)) {
        _this.loadVideo(src);
      }
    };

    _this.preloadImage = function(src, callback) {
      var img = $('<img />')
      .attr('src', src)
      .css({maxWidth: '100%'})
      .load(function() {
        clearTimeout(_this.preloadShowLoadingTimer);
        var image = this;
        if (typeof callback == 'function') {
          callback(image);
        }
      });
    };

    _this.loadImage = function(src, callback) {
      _this.preloadShowLoading = false;

      _this.preloadShowLoadingTimer = setTimeout(function() {
        _this.preloadShowLoading = true;

        var _obj = _this.lightbox.find('.lightbox-content');
        var _width = _obj.width();
        var _height = _obj.height();

        _this.lightbox.find('.lightbox-body').css({
          width: _width+'px', 
          height: _height+'px'
        });

        _obj
          .css({
            width: _width+'px', 
            height: _height+'px'
          })
          .addClass('loading dark')
          .html('');
      }, 200);

      _this.preloadImage(src, function(image) {
        var w = image.width;
        var h = image.height;

        _this.lightbox
          .addClass('is-image')
          .removeClass('is-video is-inline is-ajax is-loading');
        _this.setSize(w, h);
        _this.lightbox
          .find('.lightbox-content')
          .removeClass('loading')
          .css({ 
            width: 'auto', 
            height: 'auto' 
          })
          .html(image);

        if (typeof callback == 'function') {
          callback(image, w, h);
        }
      });
    };

    _this.loadVideo = function(src, callback) {
      var width = parseInt(_this.settings.width, 10) || 640;
      var height = parseInt(_this.settings.height, 10) || 480;
      var format = _this.settings.videoFormat;
      var extension = src.indexOf('.') > -1 ? src.split('.').pop() : false;

      if (src.indexOf('youtube') > -1) {
        src = src.replace('watch?v=', 'embed/');
        format = 'iframe';
      } else if (src.indexOf('vimeo') > -1) {
        src = src.replace('www.', '').replace('vimeo.com/', 'player.vimeo.com/video/');
        format = 'iframe';
      }

      var video = $('<div class="lightbox-video" style="width:'+width+'px; height:'+height+'px; overflow:hidden;"></div>');

      switch (format) {
        case 'flash':
          var videoPlayer = $('<object id="lightbox-video" width="'+width+'" height="'+height+'" type="application/x-shockwave-flash" data="http://releases.flowplayer.org/swf/flowplayer-3.2.18.swf">'+
          '<param name="movie" value="http://releases.flowplayer.org/swf/flowplayer-3.2.18.swf">'+
          '<param name="allowfullscreen" value="true">'+
          '<param value="true" name="allowfullscreen">'+
          '<param value="always" name="allowscriptaccess">'+
          '<param value="high" name="quality">'+
          '<param value="#000000" name="bgcolor">'+
          '<param  name="flashvars" value=\'config={"clip":{"autoPlay":false,"autoBuffering":true,"baseUrl":"'+(src.split('/').slice(0,-1).join('/'))+'/","url":"'+(src.split('/').slice(-1).join(''))+'"},"playerId":"lightbox-video","playlist":[{"autoPlay":false,"autoBuffering":true,"baseUrl":"'+(src.split('/').slice(0,-1).join('/'))+'/","url":"'+(src.split('/').slice(-1).join(''))+'"}]}\'>'+
          '</object>');
          width += 2;
          height += 2;
        break;
        case 'html5':
          var videoPlayer = $('<video width="'+width+'" height="'+height+'" '+(_this.settings.videoPoster ? 'poster="'+_this.settings.videoPoster+'"' : '')+' controls><source src="'+src+'" type="video/'+extension+'"></video>');
          width += 2;
          height += 2;
        break;
        case 'iframe':
          var videoPlayer = '<iframe id="lightbox-video" width="100%" height="100%" src="'+src+'"></iframe>';
        break;
      }

      video.html(videoPlayer);
      _this.lightbox
        .addClass('is-video')
        .removeClass('is-image is-inline is-ajax is-loading');
      _this.setSize(width, height);
      _this.lightbox.find('.lightbox-content')
        .removeClass('loading')
        .css({ width: width+'px', height: height+'px' })
        .html(video);

      if (typeof callback == 'function') {
        callback(video, width, height);
      }
    };

    _this.setSize = function(width, height) {
      _this.settings.newWidth = width || _this.settings.newWidth;
      _this.settings.newHeight = height || _this.settings.newHeight;
      var content = _this.lightbox.find('.lightbox-body');
      var contentWidth = content.outerWidth();
      var contentHeight = content.outerHeight();
      var contentMarginTop = content.css('marginTop');
      var newHeight = _this.settings.newHeight;
      var newWidth = _this.settings.newWidth;
      var newMarginTop = (_this.windowHeight() - _this.settings.newHeight) / 2;
      var animateOptions = {
        duration: 300, 
        queue: false, 
        easing: _this.settings.easing
      };

      if (_this.windowWidth() - 100 < _this.settings.newWidth) {
        newWidth = _this.windowWidth() - 100;
        newHeight = (newWidth * _this.settings.newHeight) / _this.settings.newWidth;
        newMarginTop = (_this.windowHeight() - newHeight) / 2;

        if (_this.windowHeight() - 30 < newHeight) {
          var _newHeight = _this.windowHeight() - 30;
          newWidth = (_newHeight * newWidth) / newHeight;
          newMarginTop = (_this.windowHeight() - _newHeight) / 2;
          newHeight = _newHeight;
        }
      } else if (_this.windowHeight() - 30 < _this.settings.newHeight) {
        newHeight = _this.windowHeight() - 30;
        newWidth = (newHeight * _this.settings.newWidth) / _this.settings.newHeight;
        newMarginTop = (_this.windowHeight() - newHeight) / 2;
      }

      if (!_this.settings.animate) {
        content.css({ transition: 'none' });
      }

      if (contentMarginTop != newMarginTop) {
        if (!_this.settings.animate) {
          content.css({ marginTop: newMarginTop+'px' });
        } else {
          content.animate({
            marginTop: newMarginTop+'px'
          }, animateOptions);
        }
      }

      if (contentWidth != newWidth) {
        if (!_this.settings.animate) {
          content.css({ width: newWidth +'px' });
        } else {
          content.animate({
            width: newWidth +'px'
          }, animateOptions);
        }
      }

      if (contentHeight != newHeight) {
        if (!_this.settings.animate) {
          content.css({ height: newHeight +'px' });
        } else {
          content.animate({
            height: newHeight +'px'
          }, $.extend(true, animateOptions, {
            complete: function() {
              content.css({ overflow: 'visible' });
            }
          }));
        }
      }

      if (_this.settings.isGallery) {
        var prev = _this.lightbox.find('.lightbox-prev');
        var next = _this.lightbox.find('.lightbox-next');
        var newTop = (newHeight - prev.outerHeight()) / 2;

        if (prev.css('top') != newTop || next.css('top') != newTop) {
          if (!_this.settings.animate) {
            prev.css({ top: newTop+'px' });
            next.css({ top: newTop+'px' });
          } else {
            prev.animate({
              top: newTop+'px'
            }, animateOptions);

            next.animate({
              top: newTop+'px'
            }, animateOptions);
          }
        }
      }
    }

    _this.setPosition = function(param) {
      var param = param || false;
      var content = _this.lightbox.find('.lightbox-body');

      if (param == 'initial') {
        _this.lightbox.css({ 
          visibility: 'hidden', 
          display: 'block' 
        });
        content.css({ marginTop: ((_this.windowHeight() - content.outerHeight())/2)+'px' });
        _this.lightbox.css({ 
          visibility: 'visible', 
          display: 'none' 
        });
      } else if (param == 'update') {
        content.css({ marginTop: ((_this.windowHeight() - content.outerHeight())/2)+'px' });
      } else {
        _this.setSize(false, false, false);
      }
    };

    _this.bind = function(element, settings) {
      element.off('click').click(function() {
        var settings = $.extend(true, { open: true }, settings);
        _this.init(element, settings);
        return false;
      });

      if ((settings.open != undefined && settings.open) || (typeof _this.settings != 'undefined' && typeof _this.settings.open != 'undefined' && _this.settings.open)) {
        var settings = $.extend(true, { open: true }, settings);
        _this.init(element, settings);
      }
    };

    _this.cancel = function(element) {
      element.attr('target', '_blank');
    };

    _this.open = function() {
      $('html,body').css({position: 'relative', overflow: 'hidden'});
      $('body').append(_this.lightbox);

      if (_this.settings.classes) {
        _this.lightbox.addClass(_this.settings.classes);
      }

      _this.setPosition('initial');
      _this.lightbox.fadeIn(450);

      if (typeof _this.settings.onShow == 'function') {
        _this.settings.onShow(_this.lightbox);
      }
    };

    _this.close = function() {
      $('html,body').css({ 
        position: _this.settings.documentBody.position, 
        overflow: _this.settings.documentBody.overflow
      });

      _this.lightbox.fadeOut(450, function() {
        if (_this.settings.type == 'inline') {
          $('.lightbox-content-clone').html(_this.settings.contentElement);
          $('.lightbox-content-clone').find(_this.settings.content).unwrap();
        }

        _this.lightbox.remove();

        if (typeof _this.settings.onClose == 'function') {
          _this.settings.onClose(_this.lightbox);
        }
      });
    };
  }

  global.lightbox = new Lightbox();

  $.fn.extend({
    lightbox: function(options) {
      var settings = options || {};

      return this.each(function() {
        var element = $(this);

        switch (settings) {
          default:
          case 'bind':
            global.lightbox.bind(element, settings);
          break;
          case 'open':
            global.lightbox.open();
          break;
          case 'close':
            global.lightbox.close();
          break;
          case 'update':
            global.lightbox.setPosition('update');
          break;
        }
      });
    }
  });

})(window, jQuery);
