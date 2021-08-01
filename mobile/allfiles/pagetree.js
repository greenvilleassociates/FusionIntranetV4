/*
 *  Webcom Page Tree Plugin
 * A modified Nestable jQuery Plugin originally creatied by - Copyright (c) 2012 David Bushell - http://dbushell.com/
 * Dual-licensed under the BSD or MIT licenses
 */
;
(function($, window, document, undefined) {
  var hasTouch = 'ontouchstart' in window;

  /**
   * Detect CSS pointer-events property events are normally disabled on the dragging element to avoid conflicts
   * https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
   */
  var hasPointerEvents = (function() {
    var el = document.createElement('div'), docEl = document.documentElement;
    if (!('pointerEvents' in el.style)) {
      return false;
    }
    el.style.pointerEvents = 'auto';
    el.style.pointerEvents = 'x';
    docEl.appendChild(el);
    var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
    docEl.removeChild(el);
    return !!supports;
  })();

  var mStart = 'mousedown';
  var tStart = hasTouch ? 'touchstart' : false;
  var mMove = 'mousemove';
  var tMove = hasTouch ? 'touchmove' : false;
  var mEnd = 'mouseup';
  var tEnd = hasTouch ? 'touchend' : false;
  var mCancel = 'mouseup';
  var tCancel = hasTouch ? 'touchcancel' : false;
  /* Keep this for reference
  var eStart = hasTouch ? 'touchstart' : 'mousedown'; 
  var eMove = hasTouch ? 'touchmove' : 'mousemove';
  var eEnd = hasTouch ? 'touchend'  : 'mouseup';
  var eCancel = hasTouch ? 'touchcancel' : 'mouseup';
   */
  var defaults = {
    // this is the menu offset if the menu is on 'fixed' position like ours
    menuOffsetX : -30,
    menuOffsetY : -51,
    listNodeName : 'ol',
    itemNodeName : 'li',
    baseSelector : document.body,
    rootClass : 'dd',
    listClass : 'dd-list',
    itemClass : 'dd-item',
    dragClass : 'dd-dragel',
    iconClass : 'page-icon',
    handleClass : 'dd-handle',
    lockClass : 'dd-locked',
    collapsedClass : 'dd-collapsed',
    selectedClass : 'selected',
    placeClass : 'dd-placeholder',
    noDragClass : 'dd-nodrag',
    emptyClass : 'dd-empty',
    expandBtnHTML : '<button data-action="expand" type="button">Expand</button>',
    collapseBtnHTML : '<button data-action="collapse" type="button">Collapse</button>',
    deleteClass : 'delete-icon',
    duplicateClass : 'duplicate-icon',
    settingsClass : 'settings-icon',
    hiddenClass : 'hidden-icon',
    excludedClass : 'excluded-icon',
    templateSelector : '#webcom-tree-template li',
    contentSelector : '.pm-content',
    group : 0,
    maxDepth : 2,
    threshold : 20,
    warnBeforeDelete : true,
    scrollTopY : 0,
    scrollBottomY : 0,
    hasLabel : false
  };

  function Plugin(element, options) {
    this.w = $(window);
    this.el = $(element);
    this.areClicksEnabled = true;
    this.options = $.extend({}, defaults, options);
    this.baseEl = $(this.options.baseSelector);
    this.templateEl = $(this.options.templateSelector);
    this.mouseDownEvent = false;
    this.mouseMoveEvent = false;
    this.buildPages();
    this.init();
  }

  Plugin.prototype = {
    addPages : function(pages, rootEl) {
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        this.addPage(page, rootEl);
      }
    },

    addPage : function(page, parent) {
      var t = this;
      var el = t.templateEl.clone().appendTo($(parent, t.el));
      el.data('page-item', page);
      if (page.isLocked) {
        el.addClass(t.options.lockClass);
        $("." + t.options.deleteClass, el).css("display", "none");
      }
      var content = el.find(t.options.contentSelector);
      var name = el.find(".item-label").text(page.name);
      content.prepend(name);
      if (t.options.hasLabel) {
        name.attr("title", page.name);
      }
      if (page.isSelected) {
        el.addClass(t.options.selectedClass);
      }
      t.updateIcon(page, content);
      if (page.pages && page.pages.length > 0) {
        var ol = document.createElement(t.options.listNodeName);
        ol.setAttribute("class", t.options.listClass);
        el.append(ol);
        t.addPages(page.pages, $(t.options.listNodeName, el), true);
      }
    },

    buildPages : function() {
      var pages = this.options.pages;
      var treeRoot = this.el.find("." + this.options.listClass);
      this.addPages(pages, treeRoot);
    },

    init : function() {
      var list = this;

      list.reset();

      list.el.data('webcompagetree-group', this.options.group);

      list.placeEl = $('<div class="' + list.options.placeClass + '"/>');

      $.each(this.el.find(list.options.itemNodeName), function(k, el) {
        list.setParent($(el));
      });

      list.el.on('click', 'button', function(e) {
        if (!list.areClicksEnabled) {
          return;
        }
        
        if (list.dragEl || (!hasTouch && e.button !== 0)) {
          return;
        }
        var target = $(e.currentTarget), action = target.data('action'), item = target.parent(list.options.itemNodeName);
        if (action === 'collapse') {
          list.collapseItem(item);
        }
        if (action === 'expand') {
          list.expandItem(item);
        }
        e.preventDefault();
        return;
      });
      var onStartEvent = function(e) {
        var handle = $(e.target);
        if (handle.is("button")) {
          return;
        }        

        if (handle.hasClass(list.options.iconClass) && list.areClicksEnabled) {
          list.onClickEvent(handle);
          e.preventDefault();
          return;
        }
        if (!handle.hasClass(list.options.handleClass)) {
          if (handle.closest('.' + list.options.noDragClass).length) {
            return;
          }
          handle = handle.closest('.' + list.options.handleClass);
          var liItem = handle.closest('li');
          if (liItem.hasClass(list.options.lockClass)) {
            e.preventDefault();
            return;
          }
        }
        if (!handle.length || list.dragEl || (!hasTouch && e.button !== 0) || (hasTouch && e.touches.length !== 1)) {
          return;
        }
        list.mouseDownEvent = true;
        list.mouseMoveEvent = false;
        e.preventDefault();
      };

      var onMoveEvent = function(e) {
        if (list.mouseDownEvent) {
          if (list.mouseMoveEvent === false) {
            list.mouseMoveEvent = true;
            e.preventDefault();
            list.dragStart(hasTouch ? e.touches[0] : e);
          } else if (list.dragEl) {
            e.preventDefault();
            list.dragMove(hasTouch ? e.touches[0] : e);
          }
        }
      };

      var onEndEvent = function(e) {
        list.mouseDownEvent = false;
        list.mouseMoveEvent = false;
        var handle = $(e.target);
        if (handle.is("button")) {
          return;
        }     
        
        if (handle.hasClass(list.options.iconClass) && list.areClicksEnabled) {
          e.preventDefault();
          return;
        }

        if (list.dragEl) {
          list.dragStop(hasTouch ? e.touches[0] : e);
        } else {
          if (list.areClicksEnabled) {
            var li = handle.closest('.' + list.options.itemClass);
            if (li.length > 0) {
              list.onSelectItem(li);
            }
          }
        }
        e.preventDefault();
      };

      if (hasTouch) {
        list.el[0].addEventListener(tStart, onStartEvent, false);
        window.addEventListener(tMove, onMoveEvent, false);
        window.addEventListener(tEnd, onEndEvent, false);
        window.addEventListener(tCancel, onEndEvent, false);
      }
      list.el.on(mStart, onStartEvent);
      list.w.on(mMove, onMoveEvent);
      list.w.on(mEnd, onEndEvent);
      
      var offset = this.el.offset();
      this.scrollTopY = offset.top;
      this.scrollBottomY = offset.top + this.el.height();
      var windowHeight = $(window).height();
      if (this.scrollBottomY > windowHeight) {
        this.scrollBottomY = windowHeight;
      }
    },

    onClickEvent : function(handle) {
      var li = handle.closest('li');
      var item = $.extend({}, li.data('page-item'));

      var evt = 'settings';
      if (handle.hasClass(this.options.deleteClass)) {
        if (this.options.warnBeforeDelete) {
          evt = 'warning-delete';
        } else {
          this.deleteItem(li);
          evt = 'delete';
        }
      } else if (handle.hasClass(this.options.duplicateClass)) {
        item = this.duplicateItem(li);
        evt = 'duplicate';
      }
      this.el.trigger(evt, item);
    },

    deleteItem : function(li) {
      var t = this;
      var page = li.data('page-item');
      var ol = li.parent();
      li.remove();
      var liParent = ol.parent();
      if (ol.children().length == 0) {
        ol.remove();
        this.unsetParent(liParent);
      }
      var newPages = [];
      var parentPage = liParent.data('page-item');
      if (parentPage && parentPage.pages) {
        for (var i = 0; i < parentPage.pages.length; i++) {
          var p = parentPage.pages[i];
          if (p.id != page.id) {
            newPages.push(p);
          }
        }
        parentPage.pages = newPages;
        liParent.data('page-item', parentPage);
      }
    },

    onSelectItem : function(li) {
      if (!li.hasClass(this.options.selectedClass)) {
        var item = this.selectNewItem(li);
        this.areClicksEnabled = false;
        this.el.trigger('select', item);
      }
    },

    onMoveItem : function(li) {
      var page = $.extend({}, li.data('page-item'));

      var ol = li.parent();
      var liParent = ol.parent();
      var newParent = liParent.data('page-item');
      var oldParentId = 0;
      var newParentId = 0;
      if (newParent) {
        newParentId = newParent.id;
        if (!newParent.pages) {
          newParent.pages = [];
        }
        newParent.pages.splice(this.dragItemEndIndex, 1, page);
        liParent.data('page-item', newParent);
      }
      if (this.dragItemParent) {
        var oldParent = this.dragItemParent.data('page-item');
        if (oldParent) {
          oldParentId = oldParent.id;
          if (oldParent.pages) {
            oldParent.pages.splice(this.dragItemStartIndex, 1);
            this.dragItemParent.data('page-item', oldParent);
          }
        }
      }
      var newIndex = this.dragItemEndIndex;
      if (oldParentId == newParentId) {
        if (this.dragItemEndIndex > this.dragItemStartIndex) {
          newIndex += 1;
        }
      }
      page.parentId = newParentId;
      this.el.trigger('change', [ page, newIndex ]);
    },

    selectNewItem : function(li) {
      var t = this;

      // don't select item again
      if (!li.hasClass(this.options.selectedClass)) {
        var parent = this.el;

        var selectedItem = parent.find("." + this.options.selectedClass);
        selectedItem.each(function(idx) {
          var el = $(this);
          el.removeClass(t.options.selectedClass);
          el.data('page-item').isSelected = false;
        });

        li.addClass(this.options.selectedClass);
        li.data('page-item').isSelected = true;
      }
      return $.extend({}, li.data('page-item'));
    },

    duplicateItem : function(li) {
      var treeRoot = this.el.children("." + this.options.listClass);
      var el = li.clone(true).appendTo(treeRoot);

      var newPage = $.extend({}, el.data('page-item'));
      // reset parent to root
      newPage.parentId = 0;

      // get new name for duplicted item
      var oldName = newPage.name;
      var newName = this.getCopiedItemName(newPage.name, true);
      newPage.name = newName;
      this.updateFileName(newPage);

      // Duplicate of a parent page does not duplicate children
      if (newPage.pages && newPage.pages.length > 0) {
        this.unsetParent(el);
        newPage.pages = [];
      }
      // Duplicate of a selected page does not keep selection
      if (newPage.isSelected) {
        el.removeClass(this.options.selectedClass);
        newPage.isSelected = false;
      }
      // Duplicate of a locked page does not keep the locked status
      if (newPage.isLocked) {
        el.removeClass(this.options.lockClass);
        $("." + this.options.deleteClass, el).css("display", "block");
        newPage.isLocked = false;
      }

      // keep this on bottom
      this.updateName(oldName, newName, el);
      var oldId = newPage.id;
      newPage.id = UUID.generate();
      el.data('page-item', newPage);

      return {
        id : oldId,
        page : newPage
      };
    },

    getNames : function() {
      var names = [];
      var pages = this.serialize();

      function addPages(pages) {
        for (var i = 0; i < pages.length; i++) {
          names.push(pages[i].name);
          var fileName = pages[i].fileName.replace(".html", "");
          if (fileName != pages[i].name) {
            names.push(fileName);
          }
          if (pages[i].pages) {
            addPages(pages[i].pages);
          }
        }
      }
      addPages(pages);
      return names;
    },

    getCopiedItemName : function(name, isCopy) {
      var count = 0;
      var copyNamePattern = /(.*)(\-Copy *)(\d*)$/i;
      var namePattern = /(.*)(\- *)(\d*)$/i;

      var pattern = isCopy ? copyNamePattern : namePattern;

      function getNewName(newName, names) {
        var name = newName;
        var copyName = "";
        var defaultCopyName = (isCopy) ? "-Copy" : "-1";
        var count = 0;
        if (names && names.length) {
          var re = pattern.exec(newName);
          if (re) {
            name = re[1];
            copyName = re[2] || "";
            count = re[3] || "";
          }
          for (var i = 0; i < names.length; i++) {
            var fileName = newName.replace(" ", "-", "gi").toLowerCase();
            if (newName == names[i] || fileName == names[i]) {
              if (copyName == "") {
                newName = name + defaultCopyName;
              } else {
                if (count == "") {
                  count = 1;
                  copyName += " ";
                } else {
                  count = count * 1 + 1;
                }
                newName = name + copyName + count;
              }
              return newName;
            }
          }
        }
        return newName;
      }
      var names = this.getNames();
      var newName = getNewName(name, names);
      while (newName != name) {
        name = newName;
        newName = getNewName(name, names);
      }
      return newName;
    },

    updateIcon : function(item, el) {
      var t = this;
      if (item.isHidden) {
        el.addClass(t.options.hiddenClass);
      } else {
        el.removeClass(t.options.hiddenClass);
      }
      if (item.isPubExcluded) {
        el.addClass(t.options.excludedClass);
      } else {
        el.removeClass(t.options.excludedClass);
      }
    },

    updateName : function(oldName, newName, el) {
      var handleItem = el.children("." + this.options.handleClass);
      if (handleItem.length > 0) {
        var content = handleItem.children(this.options.contentSelector);
        if (content.length > 0) {
          var html = content.html();
          content.html(html.replace(new RegExp(oldName, 'g'), newName));
        }
      }
    },

    serialize : function() {
      var data, depth = 0, list = this;
      step = function(level, depth) {
        var array = [], items = level.children(list.options.itemNodeName);
        items.each(function() {
          var li = $(this);
          var item = $.extend({}, li.data('page-item'));
          var sub = li.children(list.options.listNodeName);

          item.pages = [];
          if (sub.length) {
            item.pages = step(sub, depth + 1);
          }
          array.push(item);
        });
        return array;
      };
      data = step(list.el.find(list.options.listNodeName).first(), depth);
      return data;
    },

    reset : function() {
      this.mouse = {
        offsetX : 0,
        offsetY : 0,
        startX : 0,
        startY : 0,
        lastX : 0,
        lastY : 0,
        nowX : 0,
        nowY : 0,
        distX : 0,
        distY : 0,
        dirAx : 0,
        dirX : 0,
        dirY : 0,
        lastDirX : 0,
        lastDirY : 0,
        distAxX : 0,
        distAxY : 0
      };
      this.moving = false;
      this.dragEl = null;
      this.dragRootEl = null;
      this.dragDepth = 0;
      this.hasNewRoot = false;
      this.pointEl = null;
    },

    resetParents : function() {
      var list = this;
      list.el.find(list.options.itemNodeName).each(function() {
        var li = $(this);
        if (li.children(list.options.listNodeName).length == 0) {
          list.unsetParent(li);
        } else {
          // console.log(li.children(list.options.listNodeName));
          ;
        }
      });
    },

    expandItem : function(li) {
      li.removeClass(this.options.collapsedClass);
      li.children('[data-action="expand"]').hide();
      li.children('[data-action="collapse"]').show();
      li.children(this.options.listNodeName).show();
    },

    collapseItem : function(li) {
      var lists = li.children(this.options.listNodeName);
      if (lists.length) {
        li.addClass(this.options.collapsedClass);
        li.children('[data-action="collapse"]').hide();
        li.children('[data-action="expand"]').show();
        li.children(this.options.listNodeName).hide();
      }
    },

    expandAll : function() {
      var list = this;
      list.el.find(list.options.itemNodeName).each(function() {
        list.expandItem($(this));
      });
    },

    collapseAll : function() {
      var list = this;
      list.el.find(list.options.itemNodeName).each(function() {
        list.collapseItem($(this));
      });
    },

    setParent : function(li) {
      if (li.children(this.options.listNodeName).length) {
        li.prepend($(this.options.expandBtnHTML));
        li.prepend($(this.options.collapseBtnHTML));
      }
      li.children('[data-action="expand"]').hide();
    },

    unsetParent : function(li) {
      li.removeClass(this.options.collapsedClass);
      li.children('[data-action]').remove();
      li.children(this.options.listNodeName).remove();
    },

    dragStart : function(e) {
      var t = this;
      try {
        var mouse = this.mouse, target = $(e.target), dragItem = target.closest(this.options.itemNodeName);

        this.dragItemStartIndex = dragItem.index();
        var ol = dragItem.parent();
        var liParent = ol.parent();
        this.dragItemParent = liParent;
        this.placeEl.css('height', dragItem.height());

        mouse.offsetX = e.offsetX !== undefined ? e.offsetX : e.pageX - target.offset().left;
        mouse.offsetY = e.offsetY !== undefined ? e.offsetY : e.pageY - target.offset().top;

        mouse.offsetX = mouse.offsetX - this.options.menuOffsetX;
        mouse.offsetY = mouse.offsetY - this.options.menuOffsetY;

        mouse.startX = mouse.lastX = e.pageX;
        mouse.startY = mouse.lastY = e.pageY;

        this.lastDragPosition = e.pageY;

        this.dragRootEl = this.el;

        this.dragEl = $(document.createElement(this.options.listNodeName)).addClass(this.options.listClass + ' ' + this.options.dragClass);
        this.dragEl.css('width', dragItem.width());

        // fix for zepto.js
        // dragItem.after(this.placeEl).detach().appendTo(this.dragEl);
        dragItem.after(this.placeEl);
        dragItem[0].parentNode.removeChild(dragItem[0]);
        dragItem.appendTo(this.dragEl);

        this.baseEl.append(this.dragEl);
        this.dragEl.css({
          'left' : e.pageX - mouse.offsetX,
          'top' : e.pageY - mouse.offsetY
        });
        // total depth of dragging item
        var i, depth, items = this.dragEl.find(this.options.itemNodeName);
        for (i = 0; i < items.length; i++) {
          depth = $(items[i]).parents(this.options.listNodeName).length;
          if (depth > this.dragDepth) {
            this.dragDepth = depth;
          }
        }
        this.areClicksEnabled = false;
        $(".webcom-tooltip-directive", this.el).tooltip('disable');
      } catch (e) {
        t.el.trigger("exception", e);
      }
    },

    dragStop : function(e) {
      var t = this;
      try {
        // fix for zepto.js
        // this.placeEl.replaceWith(this.dragEl.children(this.options.itemNodeName
        // + ':first').detach());
        var el = this.dragEl.children(this.options.itemNodeName).first();
        el[0].parentNode.removeChild(el[0]);
        this.placeEl.replaceWith(el);
        this.dragItemEndIndex = el.index();
        this.dragEl.remove();
        this.onMoveItem(el);
        $(".webcom-tooltip-directive", this.el).tooltip('enable');
        this.areClicksEnabled = true;
        this.reset();
      } catch (e) {
        t.el.trigger("exception", e);
      }
    },

    dragMove : function(e) {
      var list, parent, prev, next, depth, opt = this.options, mouse = this.mouse;

      this.dragEl.css({
        'left' : e.pageX - mouse.offsetX,
        'top' : e.pageY - mouse.offsetY
      });
      this.dragDirectionUp = e.pageY < this.lastDragPosition;
      this.lastDragPosition = e.pageY;

      var isBottomLimitReached = (this.lastDragPosition + 30) > this.scrollBottomY && (!this.dragDirectionUp);
      var isTopLimitReached = (this.lastDragPosition - 30) < this.scrollTopY && this.dragDirectionUp;
      if (isBottomLimitReached || isTopLimitReached) {
        this.el.trigger('on-drag-limit', this.dragDirectionUp);
      }

      // mouse position last events
      mouse.lastX = mouse.nowX;
      mouse.lastY = mouse.nowY;
      // mouse position this events
      mouse.nowX = e.pageX;
      mouse.nowY = e.pageY;
      // distance mouse moved between events
      mouse.distX = mouse.nowX - mouse.lastX;
      mouse.distY = mouse.nowY - mouse.lastY;
      // direction mouse was moving
      mouse.lastDirX = mouse.dirX;
      mouse.lastDirY = mouse.dirY;
      // direction mouse is now moving (on both axis)
      mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
      mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1;
      // axis mouse is now moving on
      var newAx = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;

      // do nothing on first move
      if (!mouse.moving) {
        mouse.dirAx = newAx;
        mouse.moving = true;
        return;
      }

      // calc distance moved on this axis (and direction)
      if (mouse.dirAx !== newAx) {
        mouse.distAxX = 0;
        mouse.distAxY = 0;
      } else {
        mouse.distAxX += Math.abs(mouse.distX);
        if (mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) {
          mouse.distAxX = 0;
        }
        mouse.distAxY += Math.abs(mouse.distY);
        if (mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) {
          mouse.distAxY = 0;
        }
      }
      mouse.dirAx = newAx;

      /**
       * move horizontal
       */
      if (mouse.dirAx && mouse.distAxX >= opt.threshold) {
        // reset move distance on x-axis for new phase
        mouse.distAxX = 0;
        prev = this.placeEl.prev(opt.itemNodeName);
        // increase horizontal level if previous sibling exists and is not
        // collapsed
        if (mouse.distX > 0 && prev.length && !prev.hasClass(opt.collapsedClass)) {
          // cannot increase level when item above is collapsed
          list = prev.find(opt.listNodeName).last();
          // check if depth limit has reached
          depth = this.placeEl.parents(opt.listNodeName).length;
          if (depth + this.dragDepth <= opt.maxDepth) {
            // create new sub-level if one doesn't exist
            if (!list.length) {
              list = $('<' + opt.listNodeName + '/>').addClass(opt.listClass);
              list.append(this.placeEl);
              prev.append(list);
              this.setParent(prev);
            } else {
              // else append to next level up
              list = prev.children(opt.listNodeName).last();
              list.append(this.placeEl);
            }
          }
        }
        // decrease horizontal level
        if (mouse.distX < 0) {
          // we can't decrease a level if an item preceeds the current one
          next = this.placeEl.next(opt.itemNodeName);
          if (!next.length) {
            parent = this.placeEl.parent();
            this.placeEl.closest(opt.itemNodeName).after(this.placeEl);
            if (!parent.children().length) {
              this.unsetParent(parent.parent());
            }
          }
        }
      }

      var isEmpty = false;

      // find list item under cursor
      if (!hasPointerEvents) {
        this.dragEl[0].style.visibility = 'hidden';
      }
      this.pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY
          - (window.pageYOffset || document.documentElement.scrollTop)));
      if (!hasPointerEvents) {
        this.dragEl[0].style.visibility = 'visible';
      }
      if (this.pointEl.hasClass(opt.handleClass)) {
        this.pointEl = this.pointEl.parent(opt.itemNodeName);
      }
      if (this.pointEl.hasClass(opt.emptyClass)) {
        isEmpty = true;
      } else if (!this.pointEl.length || !this.pointEl.hasClass(opt.itemClass)) {
        return;
      }

      // find parent list of item under cursor
      var pointElRoot = this.pointEl.closest('.' + opt.rootClass), isNewRoot = this.dragRootEl.data('webcom-tree-id') !== pointElRoot
          .data('webcom-tree-id');

      /**
       * move vertical
       */
      if (!mouse.dirAx || isNewRoot || isEmpty) {
        // check if groups match if dragging over new root
        if (isNewRoot && opt.group !== pointElRoot.data('webcom-tree-group')) {
          return;
        }
        // check depth limit
        depth = this.dragDepth - 1 + this.pointEl.parents(opt.listNodeName).length;
        if (depth > opt.maxDepth) {
          return;
        }
        if (this.pointEl.hasClass(opt.lockClass)) {
          return;
        }

        var before = e.pageY < (this.pointEl.offset().top + this.pointEl.height() / 2);
        parent = this.placeEl.parent();
        // if empty create new list to replace empty placeholder
        if (isEmpty) {
          list = $(document.createElement(opt.listNodeName)).addClass(opt.listClass);
          list.append(this.placeEl);
          this.pointEl.replaceWith(list);
        } else if (before) {
          this.pointEl.before(this.placeEl);
        } else {
          this.pointEl.after(this.placeEl);
        }
        if (!parent.children().length) {
          this.unsetParent(parent.parent());
        }
        if (!this.dragRootEl.find(opt.itemNodeName).length) {
          this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>');
        }
        // parent root list has changed
        if (isNewRoot) {
          this.dragRootEl = pointElRoot;
          this.hasNewRoot = this.el[0] !== this.dragRootEl[0];
        }
      }
    },

    // public interface

    /*
     * Updates a page item in the builder and if the name has changed, it also updates the user inferface for it so it is visible for the
     * user. Data has to be complete as the item is replaced with the new one, and not just copied over. @param params - a map with the
     * following options: params.id - the item needed replacement (ids need to be unique) params.data - the page config map
     */
    updateItem : function(params) {
      var t = this;
      var data = params.data;
      var id = params.id;
      if (id) {
        $.each(t.el.find(t.options.itemNodeName), function(index, el) {
          var $el = $(el);
          var page = $el.data('page-item');
          if (page.id == id) {
            $(el).data('page-item', data);
            if (page.name != data.name) {
              t.updateName(page.name, data.name, $el);
            }
            t.updateIcon(data, $el.find(t.options.contentSelector));
            return false;
          }
        });
      }
    },

    /**
     * Adds a new page to the tree. If the name is already taken, it will make it unique by the default rules (Copy [index]). It will also
     * overwrite file name if name was updated. If file name is not unique, it will use the name name with default rules: " " -> "-".
     * 
     * @param params -
     *          page item object
     */
    addNewPage : function(params) {
      var newPage = params.data;
      if (newPage) {
        this.makeFileUnique(newPage);
        var treeRoot = $("." + this.options.listClass + ":first", this.el);
        this.addPage(newPage, treeRoot);
      }
    },

    selectPage : function(params) {
      var t = this;
      this.areClicksEnabled = true;
      var page = params.data;
      if (page) {
        $.each(t.el.find(t.options.itemNodeName), function(index, el) {
          var $el = $(el);
          var p = $el.data('page-item');
          if (p.id == page.id) {
            t.selectNewItem($el);
            return false;
          }
        });
      }
    },

    deletePage : function(params) {
      var t = this;
      var page = params.data;
      if (page) {
        $.each(t.el.find(t.options.itemNodeName), function(index, el) {
          var $el = $(el);
          var p = $el.data('page-item');
          if (p.id == page.id) {
            t.deleteItem($el);
            return false;
          }
        });
      }
    },

    updateFileName : function(page) {
      page.fileName = page.name.toLowerCase().replace(" ", "-", "gi") + ".html";
    },

    makeFileUnique : function(page) {
      var newName = this.getCopiedItemName(page.name);
      if (page.name != newName) {
        // If name is not unique, use the new name for name and also update file
        // name
        page.name = newName;
        this.updateFileName(page);
      } else {
        if (page.fileName) {
          var fileName = page.name.toLowerCase().replace(" ", "-", "gi") + ".html";
          if (page.fileName != fileName) {
            // if file name different from name generated name, check that file
            // name is unique
            var fileName = page.fileName.replace(".html", "");
            var newFileName = this.getCopiedItemName(fileName);
            if (newFileName != fileName) {
              // if file name not unique, use the name generated one as that is
              // unique
              this.updateFileName(page);
            }
          }
        } else {
          // page had no file name so set one
          this.updateFileName(page);
        }
      }
    },

    getUniqueNewPage : function(params) {
      var page = params.data;
      if (page) {
        this.makeFileUnique(page);
      }
      return page;
    },

    reloadPages : function(params) {
      this.w.off(mMove);
      this.w.off(mEnd);
      this.el.off(mStart);
      if (hasTouch) {
        this.el.off(tStart);
        window.removeEventListener(tMove);
        window.removeEventListener(tEnd);
        window.removeEventListener(tCancel);
      }
      this.mouseDownEvent = false;
      this.mouseMoveEvent = false;

      var treeRoot = this.el.find("." + this.options.listClass);
      treeRoot.empty();

      this.options.pages = params.data;
      this.buildPages();
      this.init();
    }
  };

  $.fn.webcomPageTree = function(params) {
    var lists = this, retval = this;

    lists.each(function() {
      var plugin = $(this).data("webcom-tree");

      if (!plugin) {
        $(this).data("webcom-tree", new Plugin(this, params));
        $(this).data("webcom-tree-id", new Date().getTime());
      } else {
        if (params.fn && typeof params.fn === 'string' && typeof plugin[params.fn] === 'function') {
          retval = plugin[params.fn](params);
        }
      }
    });

    return retval || lists;
  };

})(window.jQuery || window.Zepto, window, document);