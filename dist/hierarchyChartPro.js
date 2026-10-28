/* Hierarchy Pro 2.1.0 - bundles d3-hierarchy, d3-zoom, d3-selection, d3-transition (ISC, (c) Mike Bostock) */
var hierarchyChartPro = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/js/hierarchyChartPro.js
  var hierarchyChartPro_exports = {};
  __export(hierarchyChartPro_exports, {
    get: () => get3,
    init: () => init2,
    messages: () => messages,
    orientations: () => orientations,
    styles: () => styles,
    version: () => version
  });

  // node_modules/d3-hierarchy/src/hierarchy/count.js
  function count(node) {
    var sum = 0, children2 = node.children, i = children2 && children2.length;
    if (!i) sum = 1;
    else while (--i >= 0) sum += children2[i].value;
    node.value = sum;
  }
  function count_default() {
    return this.eachAfter(count);
  }

  // node_modules/d3-hierarchy/src/hierarchy/each.js
  function each_default(callback, that) {
    let index = -1;
    for (const node of this) {
      callback.call(that, node, ++index, this);
    }
    return this;
  }

  // node_modules/d3-hierarchy/src/hierarchy/eachBefore.js
  function eachBefore_default(callback, that) {
    var node = this, nodes = [node], children2, i, index = -1;
    while (node = nodes.pop()) {
      callback.call(that, node, ++index, this);
      if (children2 = node.children) {
        for (i = children2.length - 1; i >= 0; --i) {
          nodes.push(children2[i]);
        }
      }
    }
    return this;
  }

  // node_modules/d3-hierarchy/src/hierarchy/eachAfter.js
  function eachAfter_default(callback, that) {
    var node = this, nodes = [node], next = [], children2, i, n, index = -1;
    while (node = nodes.pop()) {
      next.push(node);
      if (children2 = node.children) {
        for (i = 0, n = children2.length; i < n; ++i) {
          nodes.push(children2[i]);
        }
      }
    }
    while (node = next.pop()) {
      callback.call(that, node, ++index, this);
    }
    return this;
  }

  // node_modules/d3-hierarchy/src/hierarchy/find.js
  function find_default(callback, that) {
    let index = -1;
    for (const node of this) {
      if (callback.call(that, node, ++index, this)) {
        return node;
      }
    }
  }

  // node_modules/d3-hierarchy/src/hierarchy/sum.js
  function sum_default(value) {
    return this.eachAfter(function(node) {
      var sum = +value(node.data) || 0, children2 = node.children, i = children2 && children2.length;
      while (--i >= 0) sum += children2[i].value;
      node.value = sum;
    });
  }

  // node_modules/d3-hierarchy/src/hierarchy/sort.js
  function sort_default(compare) {
    return this.eachBefore(function(node) {
      if (node.children) {
        node.children.sort(compare);
      }
    });
  }

  // node_modules/d3-hierarchy/src/hierarchy/path.js
  function path_default(end) {
    var start2 = this, ancestor = leastCommonAncestor(start2, end), nodes = [start2];
    while (start2 !== ancestor) {
      start2 = start2.parent;
      nodes.push(start2);
    }
    var k = nodes.length;
    while (end !== ancestor) {
      nodes.splice(k, 0, end);
      end = end.parent;
    }
    return nodes;
  }
  function leastCommonAncestor(a, b) {
    if (a === b) return a;
    var aNodes = a.ancestors(), bNodes = b.ancestors(), c = null;
    a = aNodes.pop();
    b = bNodes.pop();
    while (a === b) {
      c = a;
      a = aNodes.pop();
      b = bNodes.pop();
    }
    return c;
  }

  // node_modules/d3-hierarchy/src/hierarchy/ancestors.js
  function ancestors_default() {
    var node = this, nodes = [node];
    while (node = node.parent) {
      nodes.push(node);
    }
    return nodes;
  }

  // node_modules/d3-hierarchy/src/hierarchy/descendants.js
  function descendants_default() {
    return Array.from(this);
  }

  // node_modules/d3-hierarchy/src/hierarchy/leaves.js
  function leaves_default() {
    var leaves = [];
    this.eachBefore(function(node) {
      if (!node.children) {
        leaves.push(node);
      }
    });
    return leaves;
  }

  // node_modules/d3-hierarchy/src/hierarchy/links.js
  function links_default() {
    var root2 = this, links = [];
    root2.each(function(node) {
      if (node !== root2) {
        links.push({ source: node.parent, target: node });
      }
    });
    return links;
  }

  // node_modules/d3-hierarchy/src/hierarchy/iterator.js
  function* iterator_default() {
    var node = this, current, next = [node], children2, i, n;
    do {
      current = next.reverse(), next = [];
      while (node = current.pop()) {
        yield node;
        if (children2 = node.children) {
          for (i = 0, n = children2.length; i < n; ++i) {
            next.push(children2[i]);
          }
        }
      }
    } while (next.length);
  }

  // node_modules/d3-hierarchy/src/hierarchy/index.js
  function hierarchy(data, children2) {
    if (data instanceof Map) {
      data = [void 0, data];
      if (children2 === void 0) children2 = mapChildren;
    } else if (children2 === void 0) {
      children2 = objectChildren;
    }
    var root2 = new Node(data), node, nodes = [root2], child, childs, i, n;
    while (node = nodes.pop()) {
      if ((childs = children2(node.data)) && (n = (childs = Array.from(childs)).length)) {
        node.children = childs;
        for (i = n - 1; i >= 0; --i) {
          nodes.push(child = childs[i] = new Node(childs[i]));
          child.parent = node;
          child.depth = node.depth + 1;
        }
      }
    }
    return root2.eachBefore(computeHeight);
  }
  function node_copy() {
    return hierarchy(this).eachBefore(copyData);
  }
  function objectChildren(d) {
    return d.children;
  }
  function mapChildren(d) {
    return Array.isArray(d) ? d[1] : null;
  }
  function copyData(node) {
    if (node.data.value !== void 0) node.value = node.data.value;
    node.data = node.data.data;
  }
  function computeHeight(node) {
    var height = 0;
    do
      node.height = height;
    while ((node = node.parent) && node.height < ++height);
  }
  function Node(data) {
    this.data = data;
    this.depth = this.height = 0;
    this.parent = null;
  }
  Node.prototype = hierarchy.prototype = {
    constructor: Node,
    count: count_default,
    each: each_default,
    eachAfter: eachAfter_default,
    eachBefore: eachBefore_default,
    find: find_default,
    sum: sum_default,
    sort: sort_default,
    path: path_default,
    ancestors: ancestors_default,
    descendants: descendants_default,
    leaves: leaves_default,
    links: links_default,
    copy: node_copy,
    [Symbol.iterator]: iterator_default
  };

  // node_modules/d3-hierarchy/src/tree.js
  function defaultSeparation(a, b) {
    return a.parent === b.parent ? 1 : 2;
  }
  function nextLeft(v) {
    var children2 = v.children;
    return children2 ? children2[0] : v.t;
  }
  function nextRight(v) {
    var children2 = v.children;
    return children2 ? children2[children2.length - 1] : v.t;
  }
  function moveSubtree(wm, wp, shift) {
    var change = shift / (wp.i - wm.i);
    wp.c -= change;
    wp.s += shift;
    wm.c += change;
    wp.z += shift;
    wp.m += shift;
  }
  function executeShifts(v) {
    var shift = 0, change = 0, children2 = v.children, i = children2.length, w;
    while (--i >= 0) {
      w = children2[i];
      w.z += shift;
      w.m += shift;
      shift += w.s + (change += w.c);
    }
  }
  function nextAncestor(vim, v, ancestor) {
    return vim.a.parent === v.parent ? vim.a : ancestor;
  }
  function TreeNode(node, i) {
    this._ = node;
    this.parent = null;
    this.children = null;
    this.A = null;
    this.a = this;
    this.z = 0;
    this.m = 0;
    this.c = 0;
    this.s = 0;
    this.t = null;
    this.i = i;
  }
  TreeNode.prototype = Object.create(Node.prototype);
  function treeRoot(root2) {
    var tree = new TreeNode(root2, 0), node, nodes = [tree], child, children2, i, n;
    while (node = nodes.pop()) {
      if (children2 = node._.children) {
        node.children = new Array(n = children2.length);
        for (i = n - 1; i >= 0; --i) {
          nodes.push(child = node.children[i] = new TreeNode(children2[i], i));
          child.parent = node;
        }
      }
    }
    (tree.parent = new TreeNode(null, 0)).children = [tree];
    return tree;
  }
  function tree_default() {
    var separation = defaultSeparation, dx = 1, dy = 1, nodeSize = null;
    function tree(root2) {
      var t = treeRoot(root2);
      t.eachAfter(firstWalk), t.parent.m = -t.z;
      t.eachBefore(secondWalk);
      if (nodeSize) root2.eachBefore(sizeNode);
      else {
        var left = root2, right = root2, bottom = root2;
        root2.eachBefore(function(node) {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
          if (node.depth > bottom.depth) bottom = node;
        });
        var s = left === right ? 1 : separation(left, right) / 2, tx = s - left.x, kx = dx / (right.x + s + tx), ky = dy / (bottom.depth || 1);
        root2.eachBefore(function(node) {
          node.x = (node.x + tx) * kx;
          node.y = node.depth * ky;
        });
      }
      return root2;
    }
    function firstWalk(v) {
      var children2 = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
      if (children2) {
        executeShifts(v);
        var midpoint = (children2[0].z + children2[children2.length - 1].z) / 2;
        if (w) {
          v.z = w.z + separation(v._, w._);
          v.m = v.z - midpoint;
        } else {
          v.z = midpoint;
        }
      } else if (w) {
        v.z = w.z + separation(v._, w._);
      }
      v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
    }
    function secondWalk(v) {
      v._.x = v.z + v.parent.m;
      v.m += v.parent.m;
    }
    function apportion(v, w, ancestor) {
      if (w) {
        var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m, shift;
        while (vim = nextRight(vim), vip = nextLeft(vip), vim && vip) {
          vom = nextLeft(vom);
          vop = nextRight(vop);
          vop.a = v;
          shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
          if (shift > 0) {
            moveSubtree(nextAncestor(vim, v, ancestor), v, shift);
            sip += shift;
            sop += shift;
          }
          sim += vim.m;
          sip += vip.m;
          som += vom.m;
          sop += vop.m;
        }
        if (vim && !nextRight(vop)) {
          vop.t = vim;
          vop.m += sim - sop;
        }
        if (vip && !nextLeft(vom)) {
          vom.t = vip;
          vom.m += sip - som;
          ancestor = v;
        }
      }
      return ancestor;
    }
    function sizeNode(node) {
      node.x *= dx;
      node.y = node.depth * dy;
    }
    tree.separation = function(x) {
      return arguments.length ? (separation = x, tree) : separation;
    };
    tree.size = function(x) {
      return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], tree) : nodeSize ? null : [dx, dy];
    };
    tree.nodeSize = function(x) {
      return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], tree) : nodeSize ? [dx, dy] : null;
    };
    return tree;
  }

  // node_modules/d3-selection/src/namespaces.js
  var xhtml = "http://www.w3.org/1999/xhtml";
  var namespaces_default = {
    svg: "http://www.w3.org/2000/svg",
    xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  // node_modules/d3-selection/src/namespace.js
  function namespace_default(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
  }

  // node_modules/d3-selection/src/creator.js
  function creatorInherit(name) {
    return function() {
      var document2 = this.ownerDocument, uri = this.namespaceURI;
      return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
    };
  }
  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }
  function creator_default(name) {
    var fullname = namespace_default(name);
    return (fullname.local ? creatorFixed : creatorInherit)(fullname);
  }

  // node_modules/d3-selection/src/selector.js
  function none() {
  }
  function selector_default(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  // node_modules/d3-selection/src/selection/select.js
  function select_default(select) {
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/array.js
  function array(x) {
    return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
  }

  // node_modules/d3-selection/src/selectorAll.js
  function empty() {
    return [];
  }
  function selectorAll_default(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectAll.js
  function arrayAll(select) {
    return function() {
      return array(select.apply(this, arguments));
    };
  }
  function selectAll_default(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }
    return new Selection(subgroups, parents);
  }

  // node_modules/d3-selection/src/matcher.js
  function matcher_default(selector) {
    return function() {
      return this.matches(selector);
    };
  }
  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectChild.js
  var find = Array.prototype.find;
  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }
  function childFirst() {
    return this.firstElementChild;
  }
  function selectChild_default(match) {
    return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/selectChildren.js
  var filter = Array.prototype.filter;
  function children() {
    return Array.from(this.children);
  }
  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }
  function selectChildren_default(match) {
    return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/filter.js
  function filter_default(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/selection/sparse.js
  function sparse_default(update) {
    return new Array(update.length);
  }

  // node_modules/d3-selection/src/selection/enter.js
  function enter_default() {
    return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
  }
  function EnterNode(parent, datum2) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum2;
  }
  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) {
      return this._parent.insertBefore(child, this._next);
    },
    insertBefore: function(child, next) {
      return this._parent.insertBefore(child, next);
    },
    querySelector: function(selector) {
      return this._parent.querySelector(selector);
    },
    querySelectorAll: function(selector) {
      return this._parent.querySelectorAll(selector);
    }
  };

  // node_modules/d3-selection/src/constant.js
  function constant_default(x) {
    return function() {
      return x;
    };
  }

  // node_modules/d3-selection/src/selection/data.js
  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0, node, groupLength = group.length, dataLength = data.length;
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }
  function bindKey(parent, group, enter, update, exit, data, key) {
    var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
        exit[i] = node;
      }
    }
  }
  function datum(node) {
    return node.__data__;
  }
  function data_default(value, key) {
    if (!arguments.length) return Array.from(this, datum);
    var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
    if (typeof value !== "function") value = constant_default(value);
    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
          previous._next = next || null;
        }
      }
    }
    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }
  function arraylike(data) {
    return typeof data === "object" && "length" in data ? data : Array.from(data);
  }

  // node_modules/d3-selection/src/selection/exit.js
  function exit_default() {
    return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
  }

  // node_modules/d3-selection/src/selection/join.js
  function join_default(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    if (typeof onenter === "function") {
      enter = onenter(enter);
      if (enter) enter = enter.selection();
    } else {
      enter = enter.append(onenter + "");
    }
    if (onupdate != null) {
      update = onupdate(update);
      if (update) update = update.selection();
    }
    if (onexit == null) exit.remove();
    else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  // node_modules/d3-selection/src/selection/merge.js
  function merge_default(context) {
    var selection2 = context.selection ? context.selection() : context;
    for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Selection(merges, this._parents);
  }

  // node_modules/d3-selection/src/selection/order.js
  function order_default() {
    for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/sort.js
  function sort_default2(compare) {
    if (!compare) compare = ascending;
    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }
    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }
    return new Selection(sortgroups, this._parents).order();
  }
  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // node_modules/d3-selection/src/selection/call.js
  function call_default() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  // node_modules/d3-selection/src/selection/nodes.js
  function nodes_default() {
    return Array.from(this);
  }

  // node_modules/d3-selection/src/selection/node.js
  function node_default() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  }

  // node_modules/d3-selection/src/selection/size.js
  function size_default() {
    let size = 0;
    for (const node of this) ++size;
    return size;
  }

  // node_modules/d3-selection/src/selection/empty.js
  function empty_default() {
    return !this.node();
  }

  // node_modules/d3-selection/src/selection/each.js
  function each_default2(callback) {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/attr.js
  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }
  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }
  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }
  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }
  function attr_default(name, value) {
    var fullname = namespace_default(name);
    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    }
    return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
  }

  // node_modules/d3-selection/src/window.js
  function window_default(node) {
    return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
  }

  // node_modules/d3-selection/src/selection/style.js
  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }
  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }
  function style_default(name, value, priority) {
    return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
  }
  function styleValue(node, name) {
    return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  // node_modules/d3-selection/src/selection/property.js
  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }
  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }
  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }
  function property_default(name, value) {
    return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
  }

  // node_modules/d3-selection/src/selection/classed.js
  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }
  function classList(node) {
    return node.classList || new ClassList(node);
  }
  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }
  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };
  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }
  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }
  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }
  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }
  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }
  function classed_default(name, value) {
    var names = classArray(name + "");
    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }
    return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
  }

  // node_modules/d3-selection/src/selection/text.js
  function textRemove() {
    this.textContent = "";
  }
  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }
  function text_default(value) {
    return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
  }

  // node_modules/d3-selection/src/selection/html.js
  function htmlRemove() {
    this.innerHTML = "";
  }
  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }
  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }
  function html_default(value) {
    return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
  }

  // node_modules/d3-selection/src/selection/raise.js
  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }
  function raise_default() {
    return this.each(raise);
  }

  // node_modules/d3-selection/src/selection/lower.js
  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }
  function lower_default() {
    return this.each(lower);
  }

  // node_modules/d3-selection/src/selection/append.js
  function append_default(name) {
    var create2 = typeof name === "function" ? name : creator_default(name);
    return this.select(function() {
      return this.appendChild(create2.apply(this, arguments));
    });
  }

  // node_modules/d3-selection/src/selection/insert.js
  function constantNull() {
    return null;
  }
  function insert_default(name, before) {
    var create2 = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
    return this.select(function() {
      return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  // node_modules/d3-selection/src/selection/remove.js
  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }
  function remove_default() {
    return this.each(remove);
  }

  // node_modules/d3-selection/src/selection/clone.js
  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function clone_default(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  // node_modules/d3-selection/src/selection/datum.js
  function datum_default(value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
  }

  // node_modules/d3-selection/src/selection/on.js
  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }
  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return { type: t, name };
    });
  }
  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }
  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = { type: typename.type, name: typename.name, value, listener, options };
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }
  function on_default(typename, value, options) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;
    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }
    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  // node_modules/d3-selection/src/selection/dispatch.js
  function dispatchEvent(node, type, params) {
    var window2 = window_default(node), event = window2.CustomEvent;
    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window2.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }
    node.dispatchEvent(event);
  }
  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }
  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }
  function dispatch_default(type, params) {
    return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
  }

  // node_modules/d3-selection/src/selection/iterator.js
  function* iterator_default2() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  // node_modules/d3-selection/src/selection/index.js
  var root = [null];
  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }
  function selection() {
    return new Selection([[document.documentElement]], root);
  }
  function selection_selection() {
    return this;
  }
  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: select_default,
    selectAll: selectAll_default,
    selectChild: selectChild_default,
    selectChildren: selectChildren_default,
    filter: filter_default,
    data: data_default,
    enter: enter_default,
    exit: exit_default,
    join: join_default,
    merge: merge_default,
    selection: selection_selection,
    order: order_default,
    sort: sort_default2,
    call: call_default,
    nodes: nodes_default,
    node: node_default,
    size: size_default,
    empty: empty_default,
    each: each_default2,
    attr: attr_default,
    style: style_default,
    property: property_default,
    classed: classed_default,
    text: text_default,
    html: html_default,
    raise: raise_default,
    lower: lower_default,
    append: append_default,
    insert: insert_default,
    remove: remove_default,
    clone: clone_default,
    datum: datum_default,
    on: on_default,
    dispatch: dispatch_default,
    [Symbol.iterator]: iterator_default2
  };
  var selection_default = selection;

  // node_modules/d3-selection/src/select.js
  function select_default2(selector) {
    return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
  }

  // node_modules/d3-selection/src/sourceEvent.js
  function sourceEvent_default(event) {
    let sourceEvent;
    while (sourceEvent = event.sourceEvent) event = sourceEvent;
    return event;
  }

  // node_modules/d3-selection/src/pointer.js
  function pointer_default(event, node) {
    event = sourceEvent_default(event);
    if (node === void 0) node = event.currentTarget;
    if (node) {
      var svg = node.ownerSVGElement || node;
      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }
      if (node.getBoundingClientRect) {
        var rect = node.getBoundingClientRect();
        return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
      }
    }
    return [event.pageX, event.pageY];
  }

  // node_modules/d3-dispatch/src/dispatch.js
  var noop = { value: () => {
  } };
  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }
  function Dispatch(_) {
    this._ = _;
  }
  function parseTypenames2(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return { type: t, name };
    });
  }
  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._, T = parseTypenames2(typename + "", _), t, i = -1, n = T.length;
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }
      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };
  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }
  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({ name, value: callback });
    return type;
  }
  var dispatch_default2 = dispatch;

  // node_modules/d3-drag/src/noevent.js
  var nonpassivecapture = { capture: true, passive: false };
  function noevent_default(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // node_modules/d3-drag/src/nodrag.js
  function nodrag_default(view) {
    var root2 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", noevent_default, nonpassivecapture);
    if ("onselectstart" in root2) {
      selection2.on("selectstart.drag", noevent_default, nonpassivecapture);
    } else {
      root2.__noselect = root2.style.MozUserSelect;
      root2.style.MozUserSelect = "none";
    }
  }
  function yesdrag(view, noclick) {
    var root2 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", null);
    if (noclick) {
      selection2.on("click.drag", noevent_default, nonpassivecapture);
      setTimeout(function() {
        selection2.on("click.drag", null);
      }, 0);
    }
    if ("onselectstart" in root2) {
      selection2.on("selectstart.drag", null);
    } else {
      root2.style.MozUserSelect = root2.__noselect;
      delete root2.__noselect;
    }
  }

  // node_modules/d3-color/src/define.js
  function define_default(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  // node_modules/d3-color/src/color.js
  function Color() {
  }
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*";
  var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
  var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
  var reHex = /^#([0-9a-f]{3,8})$/;
  var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
  var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
  var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
  var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
  var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
  var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  define_default(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
  }
  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }
  define_default(Rgb, rgb, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }
  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define_default(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }

  // node_modules/d3-interpolate/src/basis.js
  function basis(t1, v0, v1, v2, v3) {
    var t2 = t1 * t1, t3 = t2 * t1;
    return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
  }
  function basis_default(values) {
    var n = values.length - 1;
    return function(t) {
      var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/basisClosed.js
  function basisClosed_default(values) {
    var n = values.length;
    return function(t) {
      var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/constant.js
  var constant_default2 = (x) => () => x;

  // node_modules/d3-interpolate/src/color.js
  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }
  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }
  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant_default2(isNaN(a) ? b : a);
    };
  }
  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant_default2(isNaN(a) ? b : a);
  }

  // node_modules/d3-interpolate/src/rgb.js
  var rgb_default = function rgbGamma(y) {
    var color2 = gamma(y);
    function rgb2(start2, end) {
      var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
      return function(t) {
        start2.r = r(t);
        start2.g = g(t);
        start2.b = b(t);
        start2.opacity = opacity(t);
        return start2 + "";
      };
    }
    rgb2.gamma = rgbGamma;
    return rgb2;
  }(1);
  function rgbSpline(spline) {
    return function(colors) {
      var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
      for (i = 0; i < n; ++i) {
        color2 = rgb(colors[i]);
        r[i] = color2.r || 0;
        g[i] = color2.g || 0;
        b[i] = color2.b || 0;
      }
      r = spline(r);
      g = spline(g);
      b = spline(b);
      color2.opacity = 1;
      return function(t) {
        color2.r = r(t);
        color2.g = g(t);
        color2.b = b(t);
        return color2 + "";
      };
    };
  }
  var rgbBasis = rgbSpline(basis_default);
  var rgbBasisClosed = rgbSpline(basisClosed_default);

  // node_modules/d3-interpolate/src/number.js
  function number_default(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  // node_modules/d3-interpolate/src/string.js
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero(b) {
    return function() {
      return b;
    };
  }
  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }
  function string_default(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs;
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm;
        else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({ i, x: number_default(am, bm) });
      }
      bi = reB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
      for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
      return s.join("");
    });
  }

  // node_modules/d3-interpolate/src/transform/decompose.js
  var degrees = 180 / Math.PI;
  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };
  function decompose_default(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees,
      skewX: Math.atan(skewX) * degrees,
      scaleX,
      scaleY
    };
  }

  // node_modules/d3-interpolate/src/transform/parse.js
  var svgNode;
  function parseCss(value) {
    const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
  }
  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  // node_modules/d3-interpolate/src/transform/index.js
  function interpolateTransform(parse, pxComma, pxParen, degParen) {
    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }
    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }
    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360;
        else if (b - a > 180) a += 360;
        q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }
    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }
    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }
    return function(a, b) {
      var s = [], q = [];
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null;
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }
  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  // node_modules/d3-interpolate/src/zoom.js
  var epsilon2 = 1e-12;
  function cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }
  function sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }
  function tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }
  var zoom_default = function zoomRho(rho, rho2, rho4) {
    function zoom(p0, p1) {
      var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
      if (d2 < epsilon2) {
        S = Math.log(w1 / w0) / rho;
        i = function(t) {
          return [
            ux0 + t * dx,
            uy0 + t * dy,
            w0 * Math.exp(rho * t * S)
          ];
        };
      } else {
        var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r12 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
        S = (r12 - r0) / rho;
        i = function(t) {
          var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
          return [
            ux0 + u * dx,
            uy0 + u * dy,
            w0 * coshr0 / cosh(rho * s + r0)
          ];
        };
      }
      i.duration = S * 1e3 * rho / Math.SQRT2;
      return i;
    }
    zoom.rho = function(_) {
      var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
      return zoomRho(_1, _2, _4);
    };
    return zoom;
  }(Math.SQRT2, 2, 4);

  // node_modules/d3-timer/src/timer.js
  var frame = 0;
  var timeout = 0;
  var interval = 0;
  var pokeDelay = 1e3;
  var taskHead;
  var taskTail;
  var clockLast = 0;
  var clockNow = 0;
  var clockSkew = 0;
  var clock = typeof performance === "object" && performance.now ? performance : Date;
  var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
    setTimeout(f, 17);
  };
  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }
  function clearNow() {
    clockNow = 0;
  }
  function Timer() {
    this._call = this._time = this._next = null;
  }
  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };
  function timer(callback, delay, time) {
    var t = new Timer();
    t.restart(callback, delay, time);
    return t;
  }
  function timerFlush() {
    now();
    ++frame;
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
      t = t._next;
    }
    --frame;
  }
  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }
  function poke() {
    var now2 = clock.now(), delay = now2 - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
  }
  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }
  function sleep(time) {
    if (frame) return;
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time - clockNow;
    if (delay > 24) {
      if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  // node_modules/d3-timer/src/timeout.js
  function timeout_default(callback, delay, time) {
    var t = new Timer();
    delay = delay == null ? 0 : +delay;
    t.restart((elapsed) => {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  // node_modules/d3-transition/src/transition/schedule.js
  var emptyOn = dispatch_default2("start", "end", "cancel", "interrupt");
  var emptyTween = [];
  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;
  function schedule_default(node, name, id2, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id2 in schedules) return;
    create(node, id2, {
      name,
      index,
      // For context during callback.
      group,
      // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }
  function init(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }
  function set2(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }
  function get2(node, id2) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id2])) throw new Error("transition not found");
    return schedule;
  }
  function create(node, id2, self) {
    var schedules = node.__transition, tween;
    schedules[id2] = self;
    self.timer = timer(schedule, 0, self.time);
    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start2, self.delay, self.time);
      if (self.delay <= elapsed) start2(elapsed - self.delay);
    }
    function start2(elapsed) {
      var i, j, n, o;
      if (self.state !== SCHEDULED) return stop();
      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;
        if (o.state === STARTED) return timeout_default(start2);
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        } else if (+i < id2) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }
      timeout_default(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return;
      self.state = STARTED;
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }
    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
      while (++i < n) {
        tween[i].call(node, t);
      }
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }
    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id2];
      for (var i in schedules) return;
      delete node.__transition;
    }
  }

  // node_modules/d3-transition/src/interrupt.js
  function interrupt_default(node, name) {
    var schedules = node.__transition, schedule, active, empty2 = true, i;
    if (!schedules) return;
    name = name == null ? null : name + "";
    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) {
        empty2 = false;
        continue;
      }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }
    if (empty2) delete node.__transition;
  }

  // node_modules/d3-transition/src/selection/interrupt.js
  function interrupt_default2(name) {
    return this.each(function() {
      interrupt_default(this, name);
    });
  }

  // node_modules/d3-transition/src/transition/tween.js
  function tweenRemove(id2, name) {
    var tween0, tween1;
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }
      schedule.tween = tween1;
    };
  }
  function tweenFunction(id2, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error();
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }
      schedule.tween = tween1;
    };
  }
  function tween_default(name, value) {
    var id2 = this._id;
    name += "";
    if (arguments.length < 2) {
      var tween = get2(this.node(), id2).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }
    return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
  }
  function tweenValue(transition2, name, value) {
    var id2 = transition2._id;
    transition2.each(function() {
      var schedule = set2(this, id2);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });
    return function(node) {
      return get2(node, id2).value[name];
    };
  }

  // node_modules/d3-transition/src/transition/interpolate.js
  function interpolate_default(a, b) {
    var c;
    return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
  }

  // node_modules/d3-transition/src/transition/attr.js
  function attrRemove2(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS2(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrConstantNS2(fullname, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attrFunctionNS2(fullname, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attr_default2(name, value) {
    var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
    return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
  }

  // node_modules/d3-transition/src/transition/attrTween.js
  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }
  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }
  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween_default(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    var fullname = namespace_default(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  // node_modules/d3-transition/src/transition/delay.js
  function delayFunction(id2, value) {
    return function() {
      init(this, id2).delay = +value.apply(this, arguments);
    };
  }
  function delayConstant(id2, value) {
    return value = +value, function() {
      init(this, id2).delay = value;
    };
  }
  function delay_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
  }

  // node_modules/d3-transition/src/transition/duration.js
  function durationFunction(id2, value) {
    return function() {
      set2(this, id2).duration = +value.apply(this, arguments);
    };
  }
  function durationConstant(id2, value) {
    return value = +value, function() {
      set2(this, id2).duration = value;
    };
  }
  function duration_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
  }

  // node_modules/d3-transition/src/transition/ease.js
  function easeConstant(id2, value) {
    if (typeof value !== "function") throw new Error();
    return function() {
      set2(this, id2).ease = value;
    };
  }
  function ease_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
  }

  // node_modules/d3-transition/src/transition/easeVarying.js
  function easeVarying(id2, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error();
      set2(this, id2).ease = v;
    };
  }
  function easeVarying_default(value) {
    if (typeof value !== "function") throw new Error();
    return this.each(easeVarying(this._id, value));
  }

  // node_modules/d3-transition/src/transition/filter.js
  function filter_default2(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/merge.js
  function merge_default2(transition2) {
    if (transition2._id !== this._id) throw new Error();
    for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Transition(merges, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/on.js
  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }
  function onFunction(id2, name, listener) {
    var on0, on1, sit = start(name) ? init : set2;
    return function() {
      var schedule = sit(this, id2), on = schedule.on;
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
      schedule.on = on1;
    };
  }
  function on_default2(name, listener) {
    var id2 = this._id;
    return arguments.length < 2 ? get2(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
  }

  // node_modules/d3-transition/src/transition/remove.js
  function removeFunction(id2) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id2) return;
      if (parent) parent.removeChild(this);
    };
  }
  function remove_default2() {
    return this.on("end.remove", removeFunction(this._id));
  }

  // node_modules/d3-transition/src/transition/select.js
  function select_default3(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule_default(subgroup[i], name, id2, i, subgroup, get2(node, id2));
        }
      }
    }
    return new Transition(subgroups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selectAll.js
  function selectAll_default2(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selectorAll_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k = 0, l = children2.length; k < l; ++k) {
            if (child = children2[k]) {
              schedule_default(child, name, id2, k, children2, inherit2);
            }
          }
          subgroups.push(children2);
          parents.push(node);
        }
      }
    }
    return new Transition(subgroups, parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selection.js
  var Selection2 = selection_default.prototype.constructor;
  function selection_default2() {
    return new Selection2(this._groups, this._parents);
  }

  // node_modules/d3-transition/src/transition/style.js
  function styleNull(name, interpolate) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }
  function styleRemove2(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function styleFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function styleMaybeRemove(id2, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
    return function() {
      var schedule = set2(this, id2), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : void 0;
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
      schedule.on = on1;
    };
  }
  function style_default2(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
    return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
  }

  // node_modules/d3-transition/src/transition/styleTween.js
  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }
  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }
  function styleTween_default(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  // node_modules/d3-transition/src/transition/text.js
  function textConstant2(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction2(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }
  function text_default2(value) {
    return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
  }

  // node_modules/d3-transition/src/transition/textTween.js
  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }
  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function textTween_default(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, textTween(value));
  }

  // node_modules/d3-transition/src/transition/transition.js
  function transition_default() {
    var name = this._name, id0 = this._id, id1 = newId();
    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit2 = get2(node, id0);
          schedule_default(node, name, id1, i, group, {
            time: inherit2.time + inherit2.delay + inherit2.duration,
            delay: 0,
            duration: inherit2.duration,
            ease: inherit2.ease
          });
        }
      }
    }
    return new Transition(groups, this._parents, name, id1);
  }

  // node_modules/d3-transition/src/transition/end.js
  function end_default() {
    var on0, on1, that = this, id2 = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = { value: reject }, end = { value: function() {
        if (--size === 0) resolve();
      } };
      that.each(function() {
        var schedule = set2(this, id2), on = schedule.on;
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }
        schedule.on = on1;
      });
      if (size === 0) resolve();
    });
  }

  // node_modules/d3-transition/src/transition/index.js
  var id = 0;
  function Transition(groups, parents, name, id2) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id2;
  }
  function transition(name) {
    return selection_default().transition(name);
  }
  function newId() {
    return ++id;
  }
  var selection_prototype = selection_default.prototype;
  Transition.prototype = transition.prototype = {
    constructor: Transition,
    select: select_default3,
    selectAll: selectAll_default2,
    selectChild: selection_prototype.selectChild,
    selectChildren: selection_prototype.selectChildren,
    filter: filter_default2,
    merge: merge_default2,
    selection: selection_default2,
    transition: transition_default,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: on_default2,
    attr: attr_default2,
    attrTween: attrTween_default,
    style: style_default2,
    styleTween: styleTween_default,
    text: text_default2,
    textTween: textTween_default,
    remove: remove_default2,
    tween: tween_default,
    delay: delay_default,
    duration: duration_default,
    ease: ease_default,
    easeVarying: easeVarying_default,
    end: end_default,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  // node_modules/d3-ease/src/cubic.js
  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  // node_modules/d3-transition/src/selection/transition.js
  var defaultTiming = {
    time: null,
    // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };
  function inherit(node, id2) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id2])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id2} not found`);
      }
    }
    return timing;
  }
  function transition_default2(name) {
    var id2, timing;
    if (name instanceof Transition) {
      id2 = name._id, name = name._name;
    } else {
      id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }
    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
        }
      }
    }
    return new Transition(groups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/selection/index.js
  selection_default.prototype.interrupt = interrupt_default2;
  selection_default.prototype.transition = transition_default2;

  // node_modules/d3-zoom/src/constant.js
  var constant_default3 = (x) => () => x;

  // node_modules/d3-zoom/src/event.js
  function ZoomEvent(type, {
    sourceEvent,
    target,
    transform: transform2,
    dispatch: dispatch2
  }) {
    Object.defineProperties(this, {
      type: { value: type, enumerable: true, configurable: true },
      sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
      target: { value: target, enumerable: true, configurable: true },
      transform: { value: transform2, enumerable: true, configurable: true },
      _: { value: dispatch2 }
    });
  }

  // node_modules/d3-zoom/src/transform.js
  function Transform(k, x, y) {
    this.k = k;
    this.x = x;
    this.y = y;
  }
  Transform.prototype = {
    constructor: Transform,
    scale: function(k) {
      return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
    },
    translate: function(x, y) {
      return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
    },
    apply: function(point) {
      return [point[0] * this.k + this.x, point[1] * this.k + this.y];
    },
    applyX: function(x) {
      return x * this.k + this.x;
    },
    applyY: function(y) {
      return y * this.k + this.y;
    },
    invert: function(location2) {
      return [(location2[0] - this.x) / this.k, (location2[1] - this.y) / this.k];
    },
    invertX: function(x) {
      return (x - this.x) / this.k;
    },
    invertY: function(y) {
      return (y - this.y) / this.k;
    },
    rescaleX: function(x) {
      return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
    },
    rescaleY: function(y) {
      return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
    },
    toString: function() {
      return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
    }
  };
  var identity2 = new Transform(1, 0, 0);
  transform.prototype = Transform.prototype;
  function transform(node) {
    while (!node.__zoom) if (!(node = node.parentNode)) return identity2;
    return node.__zoom;
  }

  // node_modules/d3-zoom/src/noevent.js
  function nopropagation(event) {
    event.stopImmediatePropagation();
  }
  function noevent_default2(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // node_modules/d3-zoom/src/zoom.js
  function defaultFilter(event) {
    return (!event.ctrlKey || event.type === "wheel") && !event.button;
  }
  function defaultExtent() {
    var e = this;
    if (e instanceof SVGElement) {
      e = e.ownerSVGElement || e;
      if (e.hasAttribute("viewBox")) {
        e = e.viewBox.baseVal;
        return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
      }
      return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
    }
    return [[0, 0], [e.clientWidth, e.clientHeight]];
  }
  function defaultTransform() {
    return this.__zoom || identity2;
  }
  function defaultWheelDelta(event) {
    return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * (event.ctrlKey ? 10 : 1);
  }
  function defaultTouchable() {
    return navigator.maxTouchPoints || "ontouchstart" in this;
  }
  function defaultConstrain(transform2, extent, translateExtent) {
    var dx0 = transform2.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform2.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform2.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform2.invertY(extent[1][1]) - translateExtent[1][1];
    return transform2.translate(
      dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
      dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
    );
  }
  function zoom_default2() {
    var filter2 = defaultFilter, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate = zoom_default, listeners = dispatch_default2("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
    function zoom(selection2) {
      selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }
    zoom.transform = function(collection, transform2, point, event) {
      var selection2 = collection.selection ? collection.selection() : collection;
      selection2.property("__zoom", defaultTransform);
      if (collection !== selection2) {
        schedule(collection, transform2, point, event);
      } else {
        selection2.interrupt().each(function() {
          gesture(this, arguments).event(event).start().zoom(null, typeof transform2 === "function" ? transform2.apply(this, arguments) : transform2).end();
        });
      }
    };
    zoom.scaleBy = function(selection2, k, p, event) {
      zoom.scaleTo(selection2, function() {
        var k0 = this.__zoom.k, k1 = typeof k === "function" ? k.apply(this, arguments) : k;
        return k0 * k1;
      }, p, event);
    };
    zoom.scaleTo = function(selection2, k, p, event) {
      zoom.transform(selection2, function() {
        var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
        return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
      }, p, event);
    };
    zoom.translateBy = function(selection2, x, y, event) {
      zoom.transform(selection2, function() {
        return constrain(this.__zoom.translate(
          typeof x === "function" ? x.apply(this, arguments) : x,
          typeof y === "function" ? y.apply(this, arguments) : y
        ), extent.apply(this, arguments), translateExtent);
      }, null, event);
    };
    zoom.translateTo = function(selection2, x, y, p, event) {
      zoom.transform(selection2, function() {
        var e = extent.apply(this, arguments), t = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
        return constrain(identity2.translate(p0[0], p0[1]).scale(t.k).translate(
          typeof x === "function" ? -x.apply(this, arguments) : -x,
          typeof y === "function" ? -y.apply(this, arguments) : -y
        ), e, translateExtent);
      }, p, event);
    };
    function scale(transform2, k) {
      k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
      return k === transform2.k ? transform2 : new Transform(k, transform2.x, transform2.y);
    }
    function translate(transform2, p0, p1) {
      var x = p0[0] - p1[0] * transform2.k, y = p0[1] - p1[1] * transform2.k;
      return x === transform2.x && y === transform2.y ? transform2 : new Transform(transform2.k, x, y);
    }
    function centroid(extent2) {
      return [(+extent2[0][0] + +extent2[1][0]) / 2, (+extent2[0][1] + +extent2[1][1]) / 2];
    }
    function schedule(transition2, transform2, point, event) {
      transition2.on("start.zoom", function() {
        gesture(this, arguments).event(event).start();
      }).on("interrupt.zoom end.zoom", function() {
        gesture(this, arguments).event(event).end();
      }).tween("zoom", function() {
        var that = this, args = arguments, g = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform2 === "function" ? transform2.apply(that, args) : transform2, i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
        return function(t) {
          if (t === 1) t = b;
          else {
            var l = i(t), k = w / l[2];
            t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
          }
          g.zoom(null, t);
        };
      });
    }
    function gesture(that, args, clean) {
      return !clean && that.__zooming || new Gesture(that, args);
    }
    function Gesture(that, args) {
      this.that = that;
      this.args = args;
      this.active = 0;
      this.sourceEvent = null;
      this.extent = extent.apply(that, args);
      this.taps = 0;
    }
    Gesture.prototype = {
      event: function(event) {
        if (event) this.sourceEvent = event;
        return this;
      },
      start: function() {
        if (++this.active === 1) {
          this.that.__zooming = this;
          this.emit("start");
        }
        return this;
      },
      zoom: function(key, transform2) {
        if (this.mouse && key !== "mouse") this.mouse[1] = transform2.invert(this.mouse[0]);
        if (this.touch0 && key !== "touch") this.touch0[1] = transform2.invert(this.touch0[0]);
        if (this.touch1 && key !== "touch") this.touch1[1] = transform2.invert(this.touch1[0]);
        this.that.__zoom = transform2;
        this.emit("zoom");
        return this;
      },
      end: function() {
        if (--this.active === 0) {
          delete this.that.__zooming;
          this.emit("end");
        }
        return this;
      },
      emit: function(type) {
        var d = select_default2(this.that).datum();
        listeners.call(
          type,
          this.that,
          new ZoomEvent(type, {
            sourceEvent: this.sourceEvent,
            target: zoom,
            type,
            transform: this.that.__zoom,
            dispatch: listeners
          }),
          d
        );
      }
    };
    function wheeled(event, ...args) {
      if (!filter2.apply(this, arguments)) return;
      var g = gesture(this, args).event(event), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer_default(event);
      if (g.wheel) {
        if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
          g.mouse[1] = t.invert(g.mouse[0] = p);
        }
        clearTimeout(g.wheel);
      } else if (t.k === k) return;
      else {
        g.mouse = [p, t.invert(p)];
        interrupt_default(this);
        g.start();
      }
      noevent_default2(event);
      g.wheel = setTimeout(wheelidled, wheelDelay);
      g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
      function wheelidled() {
        g.wheel = null;
        g.end();
      }
    }
    function mousedowned(event, ...args) {
      if (touchending || !filter2.apply(this, arguments)) return;
      var currentTarget = event.currentTarget, g = gesture(this, args, true).event(event), v = select_default2(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer_default(event, currentTarget), x0 = event.clientX, y0 = event.clientY;
      nodrag_default(event.view);
      nopropagation(event);
      g.mouse = [p, this.__zoom.invert(p)];
      interrupt_default(this);
      g.start();
      function mousemoved(event2) {
        noevent_default2(event2);
        if (!g.moved) {
          var dx = event2.clientX - x0, dy = event2.clientY - y0;
          g.moved = dx * dx + dy * dy > clickDistance2;
        }
        g.event(event2).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer_default(event2, currentTarget), g.mouse[1]), g.extent, translateExtent));
      }
      function mouseupped(event2) {
        v.on("mousemove.zoom mouseup.zoom", null);
        yesdrag(event2.view, g.moved);
        noevent_default2(event2);
        g.event(event2).end();
      }
    }
    function dblclicked(event, ...args) {
      if (!filter2.apply(this, arguments)) return;
      var t0 = this.__zoom, p0 = pointer_default(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
      noevent_default2(event);
      if (duration > 0) select_default2(this).transition().duration(duration).call(schedule, t1, p0, event);
      else select_default2(this).call(zoom.transform, t1, p0, event);
    }
    function touchstarted(event, ...args) {
      if (!filter2.apply(this, arguments)) return;
      var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
      nopropagation(event);
      for (i = 0; i < n; ++i) {
        t = touches[i], p = pointer_default(t, this);
        p = [p, this.__zoom.invert(p), t.identifier];
        if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
        else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
      }
      if (touchstarting) touchstarting = clearTimeout(touchstarting);
      if (started) {
        if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
          touchstarting = null;
        }, touchDelay);
        interrupt_default(this);
        g.start();
      }
    }
    function touchmoved(event, ...args) {
      if (!this.__zooming) return;
      var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l;
      noevent_default2(event);
      for (i = 0; i < n; ++i) {
        t = touches[i], p = pointer_default(t, this);
        if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
        else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
      }
      t = g.that.__zoom;
      if (g.touch1) {
        var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
        t = scale(t, Math.sqrt(dp / dl));
        p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
      } else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
      else return;
      g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
    }
    function touchended(event, ...args) {
      if (!this.__zooming) return;
      var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
      nopropagation(event);
      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function() {
        touchending = null;
      }, touchDelay);
      for (i = 0; i < n; ++i) {
        t = touches[i];
        if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
        else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
      }
      if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
      if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
      else {
        g.end();
        if (g.taps === 2) {
          t = pointer_default(t, this);
          if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
            var p = select_default2(this).on("dblclick.zoom");
            if (p) p.apply(this, arguments);
          }
        }
      }
    }
    zoom.wheelDelta = function(_) {
      return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant_default3(+_), zoom) : wheelDelta;
    };
    zoom.filter = function(_) {
      return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant_default3(!!_), zoom) : filter2;
    };
    zoom.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default3(!!_), zoom) : touchable;
    };
    zoom.extent = function(_) {
      return arguments.length ? (extent = typeof _ === "function" ? _ : constant_default3([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
    };
    zoom.scaleExtent = function(_) {
      return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
    };
    zoom.translateExtent = function(_) {
      return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
    };
    zoom.constrain = function(_) {
      return arguments.length ? (constrain = _, zoom) : constrain;
    };
    zoom.duration = function(_) {
      return arguments.length ? (duration = +_, zoom) : duration;
    };
    zoom.interpolate = function(_) {
      return arguments.length ? (interpolate = _, zoom) : interpolate;
    };
    zoom.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? zoom : value;
    };
    zoom.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
    };
    zoom.tapDistance = function(_) {
      return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
    };
    return zoom;
  }

  // src/js/hierarchyChartPro.js
  /*!
   * Hierarchy Pro - Oracle APEX region plug-in
   * Renders any parent/child (or CONNECT BY ... LEVEL) SQL result as an
   * interactive hierarchy: org charts, cost centres, BOMs, account trees.
   *
   * Built on d3-hierarchy (radial layout), d3-zoom, d3-selection and
   * d3-transition. The linear layout is our own contour-based tidy tree so
   * nodes can have different heights and leaf teams can be stacked or gridded.
   *
   * Public entry point (bundled as the global `hierarchyChartPro`):
   *   hierarchyChartPro.init(regionId, options, initFunction)
   * The region is registered with apex.region.create, so
   *   apex.region("orgChart").expandAll()   etc. work (see README).
   */
  var version = "2.1.0";
  var EV = "hierarchychartpro_";
  var instances = /* @__PURE__ */ new Map();
  var STYLES = ["AVATAR", "CLASSIC", "DETAILED", "PILL", "BUBBLE", "HEADER", "MINIMAL", "BADGE", "PHOTO", "CUSTOM"];
  var ORIENTS = ["TB", "BT", "LR", "RL", "RADIAL"];
  var CONNECTORS = ["ROUNDED", "ELBOW", "CURVED", "STRAIGHT"];
  var LEAFS = ["AUTO", "ROW", "STACK", "GRID"];
  var STYLE_WIDTH = { AVATAR: 210, CLASSIC: 200, DETAILED: 260, PILL: 236, BUBBLE: 150, HEADER: 240, MINIMAL: 220, BADGE: 240, PHOTO: 190, CUSTOM: 220 };
  var MORE_WIDTH = 150;
  var SLOTS = {
    AVATAR: ["photo", "subtitle", "badge", "status", "footer"],
    CLASSIC: ["icon", "subtitle", "badge", "status", "footer"],
    DETAILED: ["photo", "subtitle", "badge", "status", "body", "footer"],
    PILL: ["photo", "badge"],
    BUBBLE: ["photo", "subtitle", "badge", "status", "footer"],
    HEADER: ["photo", "subtitle", "badge", "status", "body", "footer"],
    MINIMAL: ["photo", "subtitle", "badge", "status", "footer"],
    BADGE: ["photo", "subtitle", "badge", "status", "footer"],
    PHOTO: ["photo", "subtitle", "badge", "status", "footer"],
    CUSTOM: ["photo", "subtitle", "badge", "status", "body", "footer"]
  };
  var CONTENT = { showSubtitle: "subtitle", showBadge: "badge", showStatus: "status", showBody: "body", showFooter: "footer", showTotals: "totals" };
  var NAMED = {
    red: "#dc2626",
    orange: "#ea580c",
    amber: "#d97706",
    yellow: "#ca8a04",
    green: "#16a34a",
    teal: "#0d9488",
    cyan: "#0891b2",
    blue: "#2563eb",
    indigo: "#4f46e5",
    purple: "#7c3aed",
    pink: "#db2777",
    grey: "#6b7280",
    gray: "#6b7280"
  };
  var AUTO_STATUS = ["#dc2626", "#d97706", "#2563eb", "#7c3aed", "#0d9488", "#db2777", "#4f46e5", "#ea580c"];
  var ACCENTS = ["#2563eb", "#0d9488", "#16a34a", "#d97706", "#dc2626", "#db2777", "#7c3aed", "#475569"];
  var PREF_KEYS = {
    style: (v) => STYLES.includes(v),
    orientation: (v) => ORIENTS.includes(v),
    connector: (v) => CONNECTORS.includes(v),
    leafLayout: (v) => LEAFS.includes(v),
    compact: (v) => typeof v === "boolean",
    rounded: (v) => typeof v === "boolean",
    shadow: (v) => typeof v === "boolean",
    legend: (v) => typeof v === "boolean",
    miniMap: (v) => typeof v === "boolean",
    levelBands: (v) => typeof v === "boolean",
    photos: (v) => typeof v === "boolean",
    showSubtitle: (v) => typeof v === "boolean",
    showBadge: (v) => typeof v === "boolean",
    showStatus: (v) => typeof v === "boolean",
    showTotals: (v) => typeof v === "boolean",
    showBody: (v) => typeof v === "boolean",
    showFooter: (v) => typeof v === "boolean",
    hiddenFields: (v) => Array.isArray(v) && v.length <= 100 && v.every((c) => typeof c === "string" && /^[A-Z0-9_$#]{1,128}$/.test(c)),
    nodeWidth: (v) => v === null || typeof v === "number" && v >= 100 && v <= 420,
    siblingGap: (v) => typeof v === "number" && v >= 0 && v <= 160,
    levelGap: (v) => typeof v === "number" && v >= 16 && v <= 240,
    accent: (v) => v === null || !!safeColor(v),
    highlightColor: (v) => v === null || !!safeColor(v)
  };
  var DEFAULTS = {
    ajaxId: null,
    itemsToSubmit: [],
    roles: {},
    // role -> column (id, parent or level, title required; subtitle, icon, ...)
    fields: [],
    // [{c: COLUMN, l: Label}] Body Columns 1-4 (Detailed / Colored Header / template)
    footerLabel: null,
    // heading of the Footer Column (its tooltip)
    rawHtml: [],
    // columns whose values are NOT escaped
    style: "AVATAR",
    // the developer's default view
    views: STYLES.slice(),
    // views users may switch to (the default view always included)
    template: "",
    // the Custom Template view is offered only when there is one
    showSubtitle: true,
    // card content switches; a view shows only what it has a place for
    showBadge: true,
    showStatus: true,
    showTotals: true,
    // team count and roll-up
    showBody: true,
    // body fields on views that have a body
    showFooter: true,
    // the Footer Column
    hiddenFields: [],
    // body fields a user switched off
    orientation: "TB",
    connector: "ROUNDED",
    // ROUNDED | ELBOW | CURVED | STRAIGHT
    leafLayout: "AUTO",
    // AUTO | ROW | STACK | GRID
    nodeWidth: null,
    nodeHeight: null,
    siblingGap: 24,
    levelGap: 56,
    compact: false,
    shadow: true,
    rounded: true,
    contextMenu: true,
    rememberState: false,
    lazy: false,
    miniMap: false,
    legend: true,
    levelBands: false,
    pathSubtree: false,
    ctrlWheel: true,
    animate: true,
    toolbar: ["search", "zoom", "fit", "expand", "compact", "photos", "details", "orientation", "style", "export", "fullscreen"],
    initialLevels: 2,
    maxChildren: 50,
    orphans: "ROOT",
    // ROOT | UNASSIGNED | HIDE
    onClick: "AUTO",
    // AUTO | NAVIGATE | SET_ITEM | TOGGLE | EVENT
    linkAttributes: "",
    // like a report column link's attributes, e.g. target="_blank"
    clickItem: null,
    highlightPath: "CLICK",
    // NONE | HOVER | CLICK
    highlightColor: null,
    customize: "NONE",
    // NONE | BROWSER | DATABASE - end users can change the look
    prefs: null,
    // saved customization (DATABASE: sent by the server)
    prefsKey: null,
    photos: true,
    accent: null,
    heightMode: "VIEWPORT",
    // FIXED | VIEWPORT | AUTO
    height: 600,
    initialView: "FIT",
    // FIT | ROOT | HIGHLIGHT
    imageBlob: false,
    rollupLabel: null,
    minZoom: 0.1,
    maxZoom: 2.5,
    duration: 420,
    maxNodes: 5e4,
    fileName: "hierarchy",
    noDataMessage: null,
    dataProvider: null,
    // function(request) -> Promise<response>; used by the stand-alone demo
    msg: {}
  };
  var MSG = {
    CHART: "Hierarchy chart",
    SEARCH: "Search\u2026",
    CLEAR: "Clear search",
    NO_DATA: "No data found",
    NO_MATCH: "No matches",
    MATCHES: "%0 of %1",
    PREV: "Previous match",
    NEXT: "Next match",
    ZOOM_IN: "Zoom in",
    ZOOM_OUT: "Zoom out",
    FIT: "Fit to screen",
    RESET: "Reset view",
    EXPAND_ALL: "Expand all",
    COLLAPSE_ALL: "Collapse all",
    LAYOUT: "Layout",
    STYLE: "Node style",
    EXPORT: "Export",
    FULLSCREEN: "Full screen",
    EXIT_FULLSCREEN: "Exit full screen",
    PNG: "PNG image",
    SVG: "SVG image",
    PRINT: "Print / PDF",
    OPEN: "Open",
    FOCUS: "Focus",
    EXPAND_BRANCH: "Expand branch",
    COLLAPSE_BRANCH: "Collapse branch",
    HIGHLIGHT_PATH: "Highlight path",
    SHOW_BRANCH: "Show only this branch",
    ALL: "All",
    MORE: "%0 more",
    MORE_FIELDS: "+%0 more",
    LESS: "Show less",
    UNASSIGNED: "Unassigned",
    LEVEL: "Level %0",
    CTRL_ZOOM: "Use Ctrl + scroll to zoom",
    LOADING: "Loading\u2026",
    ERROR: "The chart data could not be loaded.",
    TEAM: "%0 direct, %1 in total",
    COLLAPSE: "Collapse",
    EXPAND: "Expand",
    TB: "Top to bottom",
    BT: "Bottom to top",
    LR: "Left to right",
    RL: "Right to left",
    RADIAL: "Radial",
    S_AVATAR: "Avatar card",
    S_CLASSIC: "Classic box",
    S_DETAILED: "Detailed card",
    S_PILL: "Compact pill",
    S_BUBBLE: "Bubble",
    S_HEADER: "Colored header",
    S_MINIMAL: "Minimal",
    S_BADGE: "Badge card",
    S_PHOTO: "Photo card",
    S_CUSTOM: "Custom template",
    ONLY_HL: "Show highlighted only",
    SHOW_ALL: "Show everyone",
    NO_HL: "Nothing is highlighted",
    HL_BRANCH: "%0 highlighted in this branch",
    CUSTOMIZE: "Customize",
    CLOSE: "Close",
    C_STYLE: "Card style",
    C_LAYOUT: "Layout",
    C_CONNECTOR: "Connectors",
    C_LEAF: "Teams without reports",
    C_SIZE: "Size and spacing",
    C_WIDTH: "Card width",
    C_HGAP: "Space between cards",
    C_VGAP: "Space between levels",
    C_LOOK: "Look",
    C_COMPACT: "Compact",
    C_ROUNDED: "Rounded corners",
    C_SHADOW: "Shadows",
    C_PHOTOS: "Photos",
    C_ACCENT: "Accent colour",
    C_HLCOLOR: "Highlight colour",
    C_THEME: "Theme",
    C_SHOW: "Show",
    C_LEGEND: "Legend",
    C_MINIMAP: "Mini-map",
    C_BANDS: "Level bands",
    C_RESET: "Reset to default",
    C_SAVED: "Saved for you",
    CN_ROUNDED: "Rounded",
    CN_ELBOW: "Elbow",
    CN_CURVED: "Curved",
    CN_STRAIGHT: "Straight",
    LF_AUTO: "Auto",
    LF_ROW: "Row",
    LF_STACK: "Stack",
    LF_GRID: "Grid",
    DETAILS: "Details",
    C_CONTENT: "Card content",
    C_SUBTITLE: "Subtitle",
    C_BADGE: "Badge",
    C_STATUS: "Status",
    C_TOTALS: "Team and roll-up totals",
    C_BODY: "Details (fields)",
    C_FOOTER: "Footer",
    C_NOT_IN_VIEW: "Not on this card style",
    C_MORE: "More settings",
    NO_COLUMNS: "Choose the Node ID, Title and Parent ID (or Level) columns of this region."
  };
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;" };
  function esc(v) {
    if (v === null || v === void 0) return "";
    const s = String(v);
    const a = window.apex;
    if (a && a.util && a.util.escapeHTML) return a.util.escapeHTML(s);
    return s.replace(/[&<>"'/]/g, (c) => ESC[c]);
  }
  function fmt(s, ...args) {
    return String(s).replace(/%(\d)/g, (m, i) => args[i] !== void 0 ? args[i] : m);
  }
  function isBlank(v) {
    return v === null || v === void 0 || v === "";
  }
  function debounce(fn, ms) {
    let t;
    return function(...a) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, a), ms);
    };
  }
  function hashHue(s) {
    let h = 0;
    s = String(s || "");
    for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
    return Math.abs(h) % 360;
  }
  function initials(s) {
    const parts = String(s || "").replace(/[(),.\-_/]/g, " ").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    const a = Array.from(parts[0]);
    const b = parts.length > 1 ? Array.from(parts[parts.length - 1]) : a.slice(1);
    return ((a[0] || "") + (b[0] || "")).toUpperCase();
  }
  function norm(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ًͯ-ٰٟـ]/g, "").replace(/[آأإ]/g, "\u0627").replace(/ى/g, "\u064A").replace(/ة/g, "\u0647").toLowerCase();
  }
  function stripTags(s) {
    return String(s || "").replace(/<[^>]*>/g, "");
  }
  var COLOR_RE = [
    /^#[0-9a-f]{3,8}$/i,
    /^(rgb|rgba|hsl|hsla|oklch|lab|lch)\([\d\s.,%/+\-a-z]*\)$/i,
    /^var\(--[\w-]+\)$/,
    /^[a-z]{3,25}$/i
  ];
  function safeColor(c) {
    if (isBlank(c)) return null;
    c = String(c).trim();
    return COLOR_RE.some((r) => r.test(c)) ? c : null;
  }
  function safeUrl(u) {
    if (isBlank(u)) return null;
    u = String(u).trim();
    if (/^\s*(javascript|vbscript):/i.test(u)) return null;
    if (/^data:/i.test(u) && !/^data:image\//i.test(u)) return null;
    return u;
  }
  function safeClass(c) {
    return isBlank(c) ? "" : String(c).replace(/[^\w\- ]/g, "").trim();
  }
  function luminance(c) {
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c || "");
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    const rgb2 = [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16) / 255).map((v) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * rgb2[0] + 0.7152 * rgb2[1] + 0.0722 * rgb2[2];
  }
  function store(key, val) {
    try {
      if (val === void 0) {
        const s = window.sessionStorage.getItem(key);
        return s ? JSON.parse(s) : null;
      }
      window.sessionStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
    }
    return null;
  }
  function localStore(key, val) {
    try {
      if (val === void 0) {
        const s = window.localStorage.getItem(key);
        return s ? JSON.parse(s) : null;
      }
      if (val === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
    }
    return null;
  }
  function namedColor(v) {
    if (isBlank(v)) return null;
    const s = String(v).trim();
    return NAMED[s.toLowerCase()] || safeColor(s);
  }
  function parseLinkAttrs(s) {
    const out = { target: null, attrs: [] };
    String(s || "").replace(/([a-zA-Z][\w:-]*)\s*=\s*("([^"]*)"|'([^']*)'|(\S+))/g, (m, name, q, a, b, c) => {
      const k = name.toLowerCase();
      const v = a !== void 0 ? a : b !== void 0 ? b : c;
      if (k === "target") out.target = v;
      else if (k === "class" || k === "title" || k === "rel" || /^(data|aria)-[\w-]+$/.test(k)) out.attrs.push([k, v]);
      return m;
    });
    return out;
  }
  function splitChips(v) {
    return String(v).split(/\s*[;|]\s*|,\s+/).map((s) => s.trim()).filter(Boolean);
  }
  function cleanPrefs(p) {
    const out = {};
    if (!p || typeof p !== "object") return out;
    Object.keys(PREF_KEYS).forEach((k) => {
      if (p[k] !== void 0 && PREF_KEYS[k](p[k])) out[k] = p[k];
    });
    return out;
  }
  var easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  var r1 = (v) => Math.round(v * 10) / 10;
  var SVG_OPEN = '<svg class="hcp-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';
  var ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
    fit: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    expand: '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
    collapse: '<path d="m7 20 5-5 5 5M7 4l5 5 5-5"/>',
    layout: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>',
    style: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="3.5"/><rect x="3" y="14" width="7" height="7" rx="3.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    fullscreen: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    exitFs: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-4-5.6"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    home: '<path d="M4 11 12 4l8 7M6 9.5V20h12V9.5"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    warn: '<path d="M12 4 2.5 20h19L12 4z"/><path d="M12 10v4M12 17.5v.01"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>',
    compact: '<rect x="4" y="4" width="16" height="4" rx="1"/><rect x="4" y="10" width="16" height="4" rx="1"/><rect x="4" y="16" width="16" height="4" rx="1"/>',
    photo: '<circle cx="12" cy="9" r="3.5"/><path d="M5.5 19.5a7 7 0 0 1 13 0"/><rect x="2.5" y="2.5" width="19" height="19" rx="4"/>',
    details: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M7 9h10M7 13h10M7 17h6"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    o_tb: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
    o_bt: '<rect x="9" y="16" width="6" height="5" rx="1"/><rect x="3" y="3" width="6" height="5" rx="1"/><rect x="15" y="3" width="6" height="5" rx="1"/><path d="M12 16v-4M6 8v4h12V8"/>',
    o_lr: '<rect x="3" y="9" width="5" height="6" rx="1"/><rect x="16" y="3" width="5" height="6" rx="1"/><rect x="16" y="15" width="5" height="6" rx="1"/><path d="M8 12h4M16 6h-4v12h4"/>',
    o_rl: '<rect x="16" y="9" width="5" height="6" rx="1"/><rect x="3" y="3" width="5" height="6" rx="1"/><rect x="3" y="15" width="5" height="6" rx="1"/><path d="M16 12h-4M8 6h4v12H8"/>',
    o_radial: '<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="3.5" r="1.5"/><circle cx="20" cy="15" r="1.5"/><circle cx="4" cy="15" r="1.5"/><path d="M12 9.5V5M14.2 13.2l4.4 1.2M9.8 13.2l-4.4 1.2"/>',
    c_rounded: '<path d="M12 3v5a3 3 0 0 1-3 3H7a3 3 0 0 0-3 3v7M12 8a3 3 0 0 0 3 3h2a3 3 0 0 1 3 3v7"/>',
    c_elbow: '<path d="M12 3v8H4v10M12 11h8v10"/>',
    c_curved: '<path d="M12 3c0 9-8 7-8 18M12 3c0 9 8 7 8 18"/>',
    c_straight: '<path d="M12 3 4 21M12 3l8 18"/>'
  };
  var icon = (n) => SVG_OPEN + ICON[n] + "</svg>";
  var STYLE_PREVIEW = {
    AVATAR: '<rect x="8" y="9" width="24" height="16" rx="3"/><circle cx="20" cy="9" r="5" class="f"/><path d="M14 19h12M16 22h8"/>',
    CLASSIC: '<rect x="7" y="6" width="26" height="16" rx="2"/><path d="M7 7h26" class="b"/><path d="M13 13h14M15 17h10"/>',
    DETAILED: '<rect x="6" y="3" width="28" height="22" rx="3"/><circle cx="12" cy="9" r="3" class="f"/><path d="M17 8h11M17 11h7M10 16h20M10 20h20"/>',
    PILL: '<rect x="5" y="9" width="30" height="10" rx="5"/><circle cx="10" cy="14" r="3" class="f"/><path d="M16 14h14"/>',
    BUBBLE: '<circle cx="20" cy="11" r="7" class="f"/><path d="M13 23h14"/>',
    HEADER: '<rect x="6" y="5" width="28" height="18" rx="3"/><path d="M6 8a3 3 0 0 1 3-3h22a3 3 0 0 1 3 3v3H6z" class="f"/><path d="M11 16h18M11 19h12"/>',
    MINIMAL: '<path d="M8 8v12" class="b"/><path d="M12 11h18M12 16h12"/>',
    BADGE: '<rect x="6" y="4" width="28" height="20" rx="3"/><circle cx="12" cy="10" r="3" class="f"/><path d="M17 9h11M17 12h7"/><rect x="10" y="17" width="9" height="4" rx="2" class="f"/><rect x="21" y="17" width="8" height="4" rx="2"/>',
    PHOTO: '<rect x="10" y="2" width="20" height="24" rx="3"/><path d="M10 5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10H10z" class="f"/><path d="M14 19h12M16 22h8"/>',
    CUSTOM: '<rect x="6" y="5" width="28" height="18" rx="3" stroke-dasharray="3 2"/><path d="m16 11-3 3 3 3M24 11l3 3-3 3"/>'
  };
  var Chart = class {
    constructor(regionId, el, options) {
      const o = this.o = Object.assign({}, DEFAULTS, options || {});
      this.msg = Object.assign({}, MSG, o.msg || {});
      this.regionId = regionId;
      this.el = el;
      this.regionEl = document.getElementById(regionId) || el;
      this.custom = o.customize === "BROWSER" || o.customize === "DATABASE" ? o.customize : null;
      this.base = {};
      Object.keys(PREF_KEYS).forEach((k) => this.base[k] = o[k] === void 0 ? null : o[k]);
      this.prefsKey = "hcp-prefs:" + (o.prefsKey || location.pathname + ":" + regionId);
      this.prefs = {};
      if (this.custom) {
        this.prefs = cleanPrefs(this.custom === "BROWSER" ? localStore(this.prefsKey) : o.prefs);
        Object.assign(o, this.prefs);
      }
      const def = STYLES.includes(this.base.style) && (this.base.style !== "CUSTOM" || o.template) ? this.base.style : "AVATAR";
      const allowed = (Array.isArray(o.views) && o.views.length ? o.views : STYLES).filter((s) => s === def || STYLES.includes(s) && (s !== "CUSTOM" || o.template));
      this.views = STYLES.filter((s) => s === def || allowed.includes(s));
      this.base.style = def;
      this.style = this.views.includes(o.style) ? o.style : def;
      this.orient = ORIENTS.includes(o.orientation) ? o.orientation : "TB";
      this.rawSet = new Set((o.rawHtml || []).map((c) => String(c).toUpperCase()));
      this.toolbar = new Set(o.toolbar || []);
      if (this.custom) this.toolbar.add("customize");
      this.linkAttrs = parseLinkAttrs(o.linkAttributes);
      this.onlyHl = false;
      this.stFilter = null;
      this.stateKey = "hcp:" + location.pathname + ":" + regionId;
      this.nodes = /* @__PURE__ */ new Map();
      this.roots = [];
      this.V = [];
      this.linkEls = /* @__PURE__ */ new Map();
      this.panelEls = /* @__PURE__ */ new Map();
      this.moreNodes = /* @__PURE__ */ new Map();
      this.t = identity2;
      this.matches = [];
      this.mi = -1;
      this.hl = /* @__PURE__ */ new Set();
      this.path = null;
      this.sel = null;
      this.viewRoot = null;
      this.focusId = null;
      this.anim = null;
      this.warned = {};
      this._build();
      this._bind();
      this._restore();
    }
    /* ---------------- DOM scaffolding ---------------- */
    _build() {
      const m = this.msg;
      const tb = this.toolbar;
      const btn = (act, ic, label, extra) => `<button type="button" class="hcp-btn" data-act="${act}" title="${esc(label)}" aria-label="${esc(label)}"${extra || ""}>${icon(ic)}</button>`;
      let bar = "";
      if (tb.size) {
        bar += '<div class="hcp-tb" role="toolbar" aria-label="' + esc(m.CHART) + '">';
        if (tb.has("search")) {
          bar += '<div class="hcp-search">' + icon("search") + `<input type="search" class="hcp-q" placeholder="${esc(m.SEARCH)}" aria-label="${esc(m.SEARCH)}" autocomplete="off" spellcheck="false" enterkeyhint="search"><span class="hcp-count" aria-live="polite"></span>` + btn("prev", "up", m.PREV, " hidden") + btn("next", "down", m.NEXT, " hidden") + "</div>";
        }
        bar += '<div class="hcp-tools">';
        if (tb.has("zoom")) bar += '<span class="hcp-grp">' + btn("zoomOut", "zoomOut", m.ZOOM_OUT) + btn("zoomIn", "zoomIn", m.ZOOM_IN) + "</span>";
        if (tb.has("fit")) bar += '<span class="hcp-grp">' + btn("fit", "fit", m.FIT) + btn("reset", "reset", m.RESET) + "</span>";
        if (tb.has("expand")) bar += '<span class="hcp-grp">' + btn("expandAll", "expand", m.EXPAND_ALL) + btn("collapseAll", "collapse", m.COLLAPSE_ALL) + "</span>";
        let sw = "";
        if (tb.has("highlighted")) sw += btn("onlyHl", "filter", m.ONLY_HL, ' aria-pressed="false"');
        if (tb.has("compact")) sw += btn("compact", "compact", m.C_COMPACT, ' aria-pressed="false"');
        if (tb.has("photos")) sw += btn("photos", "photo", m.C_PHOTOS, ' aria-pressed="false"');
        if (tb.has("details")) sw += btn("details", "details", m.DETAILS, ' aria-pressed="false"');
        if (sw) bar += '<span class="hcp-grp">' + sw + "</span>";
        let g = "";
        if (tb.has("orientation")) g += btn("menuLayout", "layout", m.LAYOUT, ' aria-haspopup="menu"');
        if (tb.has("style")) g += btn("menuStyle", "style", m.STYLE, ' aria-haspopup="menu"');
        if (tb.has("export")) g += btn("menuExport", "download", m.EXPORT, ' aria-haspopup="menu"');
        if (tb.has("fullscreen")) g += btn("fullscreen", "fullscreen", m.FULLSCREEN);
        if (tb.has("customize")) g += btn("customize", "sliders", m.CUSTOMIZE, ' aria-expanded="false"');
        if (g) bar += '<span class="hcp-grp">' + g + "</span>";
        bar += "</div></div>";
      }
      this.el.innerHTML = bar + `<nav class="hcp-crumbs" hidden></nav><div class="hcp-vp"><div class="hcp-stage"><svg class="hcp-svg" aria-hidden="true" focusable="false"><g class="hcp-bands"></g><g class="hcp-panels"></g><g class="hcp-lks"></g></svg><div class="hcp-nodes" role="tree" aria-label="${esc(m.CHART)}"></div></div><div class="hcp-legend" hidden></div><canvas class="hcp-mini" hidden></canvas><div class="hcp-hint" aria-hidden="true"></div><div class="hcp-msg" hidden></div><div class="hcp-busy" hidden><span class="hcp-spin"></span></div></div>`;
      const q = (s) => this.el.querySelector(s);
      this.vp = q(".hcp-vp");
      this.stage = q(".hcp-stage");
      this.svg = q(".hcp-svg");
      this.gBands = q(".hcp-bands");
      this.gPanels = q(".hcp-panels");
      this.gLinks = q(".hcp-lks");
      this.layer = q(".hcp-nodes");
      this.legendEl = q(".hcp-legend");
      this.mini = q(".hcp-mini");
      this.hint = q(".hcp-hint");
      this.msgEl = q(".hcp-msg");
      this.busy = q(".hcp-busy");
      this.crumbs = q(".hcp-crumbs");
      this.qEl = q(".hcp-q");
      this._classes();
      this._sizeViewport();
    }
    _classes() {
      const o = this.o;
      const c = this.el.classList;
      c.add("hcp");
      this.rtl = getComputedStyle(this.el).direction === "rtl";
      c.toggle("hcp--rtl", this.rtl);
      this.eo = this.rtl && this.orient === "LR" ? "RL" : this.rtl && this.orient === "RL" ? "LR" : this.orient;
      ORIENTS.forEach((x) => c.remove("hcp--" + x.toLowerCase()));
      c.add("hcp--" + this.eo.toLowerCase());
      STYLES.forEach((x) => c.remove("hcp-s-" + x.toLowerCase()));
      c.add("hcp-s-" + this.style.toLowerCase());
      c.toggle("hcp--compact", !!o.compact);
      c.toggle("hcp--noshadow", !o.shadow);
      c.toggle("hcp--square", !o.rounded);
      c.toggle("hcp--only", !!this.onlyHl);
      const setVar = (name, v) => safeColor(v) ? this.el.style.setProperty(name, safeColor(v)) : this.el.style.removeProperty(name);
      setVar("--hcp-hl", o.highlightColor);
      setVar("--hcp-primary", o.accent);
      this._syncSwitches();
    }
    // does the current view have a place for this slot (photo, subtitle, badge, status, body)?
    _has(slot) {
      return (SLOTS[this.style] || SLOTS.AVATAR).includes(slot);
    }
    // a slot is drawn when the view has it and its card content switch is on
    _show(slot) {
      const o = this.o;
      switch (slot) {
        case "subtitle":
          return this._has("subtitle") && o.showSubtitle !== false;
        case "badge":
          return this._has("badge") && o.showBadge !== false;
        case "status":
          return this._has("status") && o.showStatus !== false;
        case "body":
          return this._has("body") && o.showBody !== false && this.fields && this.fields.length > 0;
        case "totals":
          return o.showTotals !== false;
        case "footer":
          return this._has("footer") && o.showFooter !== false && this.ci && this.ci.footer >= 0;
        default:
          return this._has(slot);
      }
    }
    // toolbar switches show their state; Details is off on views without a body
    _syncSwitches() {
      const o = this.o;
      const set3 = (act, on, disabled) => {
        const b = this.el.querySelector(`[data-act="${act}"]`);
        if (!b) return;
        b.classList.toggle("is-on", !!on && !disabled);
        b.setAttribute("aria-pressed", String(!!on && !disabled));
        b.disabled = !!disabled;
        if (act === "details") b.title = disabled ? this.msg.DETAILS + " - " + this.msg.C_NOT_IN_VIEW : this.msg.DETAILS;
      };
      set3("compact", o.compact);
      set3("photos", o.photos !== false, !this._has("photo"));
      set3("details", o.showBody !== false, !this._has("body") || !(this.fields && this.fields.length));
    }
    _sizeViewport() {
      const o = this.o;
      if (o.heightMode === "FIXED") {
        this.vp.style.height = Math.max(160, +o.height || 600) + "px";
      } else if (o.heightMode === "VIEWPORT") {
        if (this.isFs) return this.vp.style.height = "";
        const top = this.vp.getBoundingClientRect().top + window.scrollY;
        const h = window.innerHeight - (top - window.scrollY) - 24;
        this.vp.style.height = Math.max(360, Math.min(h, window.innerHeight - 40)) + "px";
      } else if (!this.vp.style.height) {
        this.vp.style.height = "420px";
      }
    }
    /* ---------------- events ---------------- */
    _bind() {
      const o = this.o;
      this.zoom = zoom_default2().scaleExtent([o.minZoom, o.maxZoom]).filter((ev) => {
        if (ev.target.closest && ev.target.closest(".hcp-cfg")) return false;
        if (ev.type === "wheel") {
          if (o.ctrlWheel && !(ev.ctrlKey || ev.metaKey)) {
            this._hint();
            return false;
          }
          return true;
        }
        if (ev.type === "dblclick") return false;
        if (ev.button) return false;
        return !ev.target.closest(".hcp-tg,.hcp-legend,.hcp-mini,.hcp-menu,input,button,a");
      }).on("zoom", (ev) => {
        this.t = ev.transform;
        this._applyTransform();
      }).on("end", () => {
        this._cull();
        this._drawMini();
      });
      this.vpSel = select_default2(this.vp).call(this.zoom).on("dblclick.zoom", null);
      this.el.addEventListener("click", (ev) => {
        const b = ev.target.closest("[data-act]");
        if (!b || !this.el.contains(b)) return;
        this._act(b.getAttribute("data-act"), b, ev);
      });
      const L = this.layer;
      L.addEventListener("click", (ev) => {
        const el = ev.target.closest(".hcp-node");
        if (!el) return;
        const n = this._byEl(el);
        if (!n) return;
        if (n.more) return this._showMore(n.parent);
        if (ev.target.closest(".hcp-tg")) return this.toggle(n.id);
        this._click(n, ev);
      });
      L.addEventListener("dblclick", (ev) => {
        const n = this._byEl(ev.target.closest(".hcp-node"));
        if (n && !n.more) this._fire("node_dblclick", this._eventData(n));
      });
      L.addEventListener("contextmenu", (ev) => {
        const n = this._byEl(ev.target.closest(".hcp-node"));
        if (!n || n.more || !o.contextMenu) return;
        ev.preventDefault();
        this._nodeMenu(n, { x: ev.clientX, y: ev.clientY });
      });
      L.addEventListener("mouseover", (ev) => {
        if (o.highlightPath !== "HOVER") return;
        const n = this._byEl(ev.target.closest(".hcp-node"));
        if (n && !n.more && n !== this.path) this.setPath(n.id);
      });
      L.addEventListener("mouseleave", () => {
        if (o.highlightPath === "HOVER") this.clearPath();
      });
      L.addEventListener("keydown", (ev) => this._key(ev));
      L.addEventListener("focusin", (ev) => {
        const n = this._byEl(ev.target.closest(".hcp-node"));
        if (n) this._setFocus(n, false);
      });
      L.addEventListener("error", (ev) => {
        if (ev.target.tagName === "IMG") ev.target.remove();
      }, true);
      this.vp.addEventListener("scroll", () => {
        if (this.vp.scrollTop || this.vp.scrollLeft) {
          this.vp.scrollTop = 0;
          this.vp.scrollLeft = 0;
        }
      });
      this.vp.addEventListener("keydown", (ev) => {
        if (ev.target.closest("input")) return;
        if (ev.key === "+" || ev.key === "=") {
          this.zoomBy(1.25);
          ev.preventDefault();
        } else if (ev.key === "-" || ev.key === "_") {
          this.zoomBy(0.8);
          ev.preventDefault();
        } else if (ev.key === "0") {
          this.fit();
          ev.preventDefault();
        }
      });
      if (this.qEl) {
        const run = debounce(() => this.search(this.qEl.value), 220);
        this.qEl.addEventListener("input", run);
        this.qEl.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") {
            ev.preventDefault();
            this._step(ev.shiftKey ? -1 : 1);
          } else if (ev.key === "Escape") {
            this.qEl.value = "";
            this.search("");
          }
        });
      }
      this.legendEl.addEventListener("click", (ev) => {
        const s = ev.target.closest("[data-st]");
        if (s) {
          const v2 = s.getAttribute("data-st");
          return this.statusFilter(this.stFilter === v2 ? null : v2);
        }
        const b = ev.target.closest("[data-lg]");
        if (!b) return;
        const v = b.getAttribute("data-lg");
        this._legendFilter(this.lgFilter === v ? null : v);
      });
      const mm = (ev) => {
        if (!this.miniMap) return;
        const r = this.mini.getBoundingClientRect();
        const p = this.miniMap.toWorld(ev.clientX - r.left, ev.clientY - r.top);
        const k = this.t.k;
        this._setTransform(identity2.translate(this.vw / 2 - p.x * k, this.vh / 2 - p.y * k).scale(k), 0);
      };
      this.mini.addEventListener("pointerdown", (ev) => {
        this.mini.setPointerCapture(ev.pointerId);
        this.miniDrag = true;
        mm(ev);
      });
      this.mini.addEventListener("pointermove", (ev) => this.miniDrag && mm(ev));
      this.mini.addEventListener("pointerup", () => this.miniDrag = false);
      const onResize = debounce(() => {
        this._sizeViewport();
        this._measureVp();
        if (this.pending) this._render(true);
        this._cull();
        this._drawMini();
      }, 120);
      window.addEventListener("resize", onResize);
      if (window.ResizeObserver) {
        this.ro = new ResizeObserver(onResize);
        this.ro.observe(this.vp);
      }
      if (window.apex && apex.jQuery) apex.jQuery(window).on("apexwindowresized", onResize);
      document.addEventListener("fullscreenchange", () => {
        const fs = document.fullscreenElement === this.el;
        if (fs !== this.isFs) this._fsChanged(fs);
      });
    }
    _itemVal(name) {
      if (window.apex && apex.item) return apex.item(name).getValue();
      const e = document.getElementById(name);
      return e ? e.value : null;
    }
    _ids(v) {
      if (isBlank(v)) return [];
      return (Array.isArray(v) ? v : String(v).split(/[:,]/)).map((s) => String(s).trim()).filter(Boolean);
    }
    _act(a, b) {
      switch (a) {
        case "zoomIn":
          return this.zoomBy(1.3);
        case "zoomOut":
          return this.zoomBy(1 / 1.3);
        case "fit":
          return this.fit();
        case "reset":
          return this.reset();
        case "expandAll":
          return this.expandAll();
        case "collapseAll":
          return this.collapseAll();
        case "prev":
          return this._step(-1);
        case "next":
          return this._step(1);
        case "fullscreen":
          return this.toggleFullscreen();
        case "onlyHl":
          return this.showHighlightedOnly(!this.onlyHl);
        case "compact":
          return this._pref("compact", !this.o.compact);
        case "photos":
          return this._pref("photos", this.o.photos === false);
        case "details":
          return this._pref("showBody", !this.o.showBody);
        case "customize":
          return this._cfgToggle();
        case "crumb": {
          const id2 = b.getAttribute("data-id");
          return this.drillTo(id2 === "" ? null : id2);
        }
        case "menuLayout":
          return this._menu(b, ORIENTS.map((x) => ({ label: this.msg[x], checked: x === this.orient, run: () => this._pref("orientation", x) })));
        case "menuStyle":
          return this._menu(b, this.views.map((s) => ({ label: this.msg["S_" + s], checked: s === this.style, run: () => this._pref("style", s) })));
        case "menuExport":
          return this._menu(b, [
            { label: this.msg.PNG, run: () => this.exportImage("png") },
            { label: this.msg.SVG, run: () => this.exportImage("svg") },
            { label: this.msg.PRINT, run: () => this.print() }
          ]);
      }
    }
    _hint() {
      const m = this.msg.CTRL_ZOOM.replace("Ctrl", /Mac|iPhone|iPad/.test(navigator.platform) ? "\u2318" : "Ctrl");
      this.hint.textContent = m;
      this.hint.classList.add("is-on");
      clearTimeout(this.hintT);
      this.hintT = setTimeout(() => this.hint.classList.remove("is-on"), 1300);
    }
    /* ---------------- data ---------------- */
    _request(params) {
      const o = this.o;
      if (o.dataProvider) return Promise.resolve(o.dataProvider(params, this));
      if (!window.apex || !apex.server) return Promise.reject(new Error("apex.server not available"));
      return new Promise((resolve, reject) => {
        apex.server.plugin(o.ajaxId, Object.assign({ pageItems: o.itemsToSubmit }, params), {
          dataType: "json",
          success: resolve,
          error: (xhr, status, err) => reject(new Error(xhr && xhr.responseText || err || status))
        });
      });
    }
    load(isRefresh) {
      this._busy(true);
      if (isRefresh) this._fire("before_refresh", {}, "apexbeforerefresh");
      return this._request({ x01: "DATA" }).then((res) => {
        this._busy(false);
        if (res && res.error) throw new Error(res.error);
        this._ingest(res, isRefresh ? "refresh" : "replace");
        this._render(true);
        if (isRefresh) this._fire("after_refresh", {}, "apexafterrefresh");
      }).catch((err) => {
        this._busy(false);
        if (err && err.config) this._showMsg(err.message, " ");
        else this._showMsg(this.msg.ERROR, String(err && err.message ? err.message : err));
        if (window.console) console.error("Hierarchy Pro:", err);
      });
    }
    refresh() {
      return this.load(true);
    }
    _busy(on) {
      clearTimeout(this.busyT);
      if (on) this.busyT = setTimeout(() => this.busy.hidden = false, 150);
      else this.busy.hidden = true;
    }
    _warn(kind, text, list) {
      if (this.warned[kind]) return;
      this.warned[kind] = true;
      if (window.console) console.warn("Hierarchy Pro [" + this.regionId + "]: " + text, list && list.length ? list.slice(0, 20) : "");
    }
    // Column roles come from the region's Columns settings - nothing is guessed from aliases.
    // Node ID, Title and Parent ID (or Level) are required.
    _resolveRoles(cols) {
      const o = this.o;
      const idx = {};
      const roles = {};
      Object.keys(o.roles || {}).forEach((r) => {
        if (!isBlank(o.roles[r])) roles[r] = String(o.roles[r]).toUpperCase();
      });
      Object.keys(roles).forEach((r) => {
        idx[r] = cols.indexOf(roles[r]);
        if (idx[r] < 0) this._warn("col-" + r, "the " + r + " column " + roles[r] + " is not in the query.");
      });
      if (!(idx.id >= 0) || !(idx.title >= 0) || !(idx.parent >= 0 || idx.level >= 0)) {
        const e = new Error(this.msg.NO_COLUMNS);
        e.config = true;
        throw e;
      }
      this.ci = idx;
      this.roles = roles;
      this.fields = (o.fields || []).map((f) => ({ c: String(f.c).toUpperCase(), i: cols.indexOf(String(f.c).toUpperCase()), l: f.l, raw: this.rawSet.has(String(f.c).toUpperCase()) })).filter((f) => f.i >= 0);
    }
    _v(n, role) {
      if (n.virt) return role === "title" ? n.vt : null;
      const i = this.ci[role];
      return i >= 0 && n.r ? n.r[i] : null;
    }
    _ingest(res, mode) {
      const cols = (res.cols || []).map((c) => String(c).toUpperCase());
      const rows = res.rows || [];
      const o = this.o;
      if (mode !== "merge") {
        const prev = mode === "refresh" ? this.nodes : null;
        this.cols = cols;
        this._resolveRoles(cols);
        this.nodes = /* @__PURE__ */ new Map();
        this.roots = [];
        this.moreNodes.clear();
        this.prevState = prev;
        this.lazy = !!o.lazy && this.ci.parent >= 0;
        this.truncated = !!res.truncated;
        if (res.truncated) this._warn("trunc", "the query returned more rows than the region's row limit; the chart is incomplete.");
      }
      const ci = this.ci;
      const levelMode = !(ci.parent >= 0) && ci.level >= 0;
      const stack = [];
      const added = [];
      const dups = [];
      for (let k = 0; k < rows.length; k++) {
        const r = rows[k];
        const id2 = isBlank(r[ci.id]) ? null : String(r[ci.id]);
        if (id2 === null) continue;
        if (this.nodes.has(id2)) {
          if (mode !== "merge") dups.push(id2);
          continue;
        }
        if (this.nodes.size >= o.maxNodes) {
          this._warn("max", "more than " + o.maxNodes + " nodes; the rest were ignored.");
          break;
        }
        let pid = null;
        if (levelMode) {
          const lv = Math.max(1, parseInt(r[ci.level], 10) || 1);
          stack.length = lv;
          stack[lv - 1] = id2;
          pid = lv > 1 && stack[lv - 2] ? stack[lv - 2] : null;
        } else if (ci.parent >= 0) {
          pid = isBlank(r[ci.parent]) ? null : String(r[ci.parent]);
        }
        const n = {
          id: id2,
          pid,
          r,
          seq: this.seq = (this.seq || 0) + 1,
          kids: [],
          parent: null,
          exp: false,
          lim: o.maxChildren,
          loaded: !this.lazy,
          cc: null
        };
        if (res.counts && res.counts[id2] !== void 0) n.cc = +res.counts[id2];
        this.nodes.set(id2, n);
        added.push(n);
      }
      if (dups.length) this._warn("dup", dups.length + " duplicate node id(s) ignored:", dups);
      const orphans = [];
      for (const n of added) {
        if (n.pid === null || n.pid === n.id) {
          if (n.pid === n.id) this._warn("self", "node(s) pointing at themselves as parent were made roots.", [n.id]);
          this.roots.push(n);
          continue;
        }
        const p = this.nodes.get(n.pid);
        if (p) {
          n.parent = p;
          p.kids.push(n);
        } else orphans.push(n);
      }
      if (orphans.length) {
        if (this.lazy && mode === "merge") {
          orphans.forEach((n) => this.roots.push(n));
        } else {
          this._warn("orphan", orphans.length + " node(s) reference a parent that is not in the data (" + o.orphans + "):", orphans.map((n) => n.id));
          if (o.orphans === "HIDE") orphans.forEach((n) => this.nodes.delete(n.id));
          else if (o.orphans === "UNASSIGNED") {
            let u = this.nodes.get("unassigned");
            if (!u) {
              u = { id: "unassigned", pid: null, virt: true, vt: this.msg.UNASSIGNED, r: null, kids: [], parent: null, exp: false, lim: o.maxChildren, loaded: true, seq: 1e12 };
              this.nodes.set(u.id, u);
              this.roots.push(u);
            }
            orphans.forEach((n) => {
              n.parent = u;
              u.kids.push(n);
            });
          } else orphans.forEach((n) => this.roots.push(n));
        }
      }
      if (mode !== "merge") this._breakCycles();
      this._sortAll(added, mode);
      this._derive();
      if (mode !== "merge") this._initExpanded(res);
    }
    // Nodes not reachable from a root sit on a cycle. Cut each cycle at the
    // first node found on it, warn, and make that node a root.
    _breakCycles() {
      const seen = /* @__PURE__ */ new Set();
      const walk = (start2) => {
        const st = [start2];
        while (st.length) {
          const n = st.pop();
          if (seen.has(n)) continue;
          seen.add(n);
          for (const k of n.kids) st.push(k);
        }
      };
      this.roots.forEach(walk);
      if (seen.size === this.nodes.size) return;
      const cut = [];
      for (const n of this.nodes.values()) {
        if (seen.has(n)) continue;
        const chain = /* @__PURE__ */ new Set();
        let c = n;
        while (c && !chain.has(c) && !seen.has(c)) {
          chain.add(c);
          c = c.parent;
        }
        if (c && chain.has(c)) {
          const p = c.parent;
          if (p) p.kids.splice(p.kids.indexOf(c), 1);
          c.parent = null;
          this.roots.push(c);
          cut.push(c.id);
          walk(c);
        }
      }
      if (cut.length) this._warn("cycle", cut.length + " cycle(s) in the parent/child data were broken at:", cut);
    }
    // siblings keep the query's ORDER BY (rows that arrive later in lazy mode go after)
    _sortAll(added, mode) {
      const cmp = (a, b) => a.seq - b.seq;
      if (mode === "merge") {
        const ps = new Set(added.map((n) => n.parent).filter(Boolean));
        ps.forEach((p) => p.kids.sort(cmp));
      } else {
        for (const n of this.nodes.values()) if (n.kids.length > 1) n.kids.sort(cmp);
        this.roots.sort(cmp);
      }
    }
    // depth, descendant counts, roll-ups, legend - iterative so deep trees can't blow the stack
    _derive() {
      const ri = this.ci.rollup;
      const order = [];
      const st = this.roots.map((r) => (r.depth = 0, r));
      while (st.length) {
        const n = st.pop();
        order.push(n);
        for (const k of n.kids) {
          k.depth = n.depth + 1;
          st.push(k);
        }
      }
      for (let i = order.length - 1; i >= 0; i--) {
        const n = order[i];
        let d = 0, s = ri >= 0 && n.r && !isBlank(n.r[ri]) ? +n.r[ri] || 0 : 0, h = 0;
        for (const k of n.kids) {
          d += 1 + k.desc;
          s += k.roll;
          h += k.hlc + (this._flag(k) ? 1 : 0);
        }
        n.desc = d;
        n.roll = s;
        n.hlc = h;
        n.txt = null;
      }
      this.order = order;
      const sm = /* @__PURE__ */ new Map();
      for (const n of order) {
        const f = this._flag(n);
        if (!f || !f.label) continue;
        const e = sm.get(f.label);
        if (e) e.count++;
        else sm.set(f.label, { color: f.color, count: 1 });
      }
      this.statusMap = sm;
      const lg = /* @__PURE__ */ new Map();
      if (this.ci.legend >= 0) {
        for (const n of order) {
          const l = this._v(n, "legend");
          if (!isBlank(l) && !lg.has(l)) lg.set(l, safeColor(this._v(n, "color")));
        }
      }
      this.legendMap = lg;
    }
    _initExpanded() {
      const o = this.o;
      const saved = o.rememberState ? store(this.stateKey) : null;
      const prev = this.prevState;
      for (const n of this.nodes.values()) {
        if (prev && prev.has(n.id)) {
          const p = prev.get(n.id);
          n.exp = p.exp;
          n.lim = Math.max(p.lim || o.maxChildren, o.maxChildren);
        } else if (saved && saved.e) {
          n.exp = false;
        } else {
          n.exp = n.depth < (o.initialLevels || 1) - 1;
        }
        if (!this.lazy) n.loaded = true;
        else n.loaded = n.kids.length > 0 || n.cc === 0;
      }
      if (saved && saved.e && !prev) saved.e.forEach((id2) => {
        const n = this.nodes.get(id2);
        if (n) n.exp = true;
      });
      if (this.stFilter && !this.statusMap.has(this.stFilter)) this.stFilter = null;
      if (this.viewRoot) this.viewRoot = this.nodes.get(this.viewRoot.id) || null;
      if (this.sel) this.sel = this.nodes.get(this.sel.id) || null;
      this.prevState = null;
    }
    hasKids(n) {
      return !n.more && (n.kids.length > 0 || this.lazy && !n.loaded && n.cc > 0);
    }
    kidCount(n) {
      return this.lazy && !n.loaded ? n.cc || 0 : n.kids.length;
    }
    /* ---------------- state persistence ---------------- */
    _save() {
      if (!this.o.rememberState) return;
      const e = [];
      for (const n of this.nodes.values()) if (n.exp) e.push(n.id);
      store(this.stateKey, { e, o: this.orient, s: this.style, v: this.viewRoot ? this.viewRoot.id : null });
    }
    _restore() {
      if (!this.o.rememberState) return;
      const s = store(this.stateKey);
      if (!s) return;
      if (ORIENTS.includes(s.o) && !this.custom) this.orient = s.o;
      if (STYLES.includes(s.s) && (s.s !== "CUSTOM" || this.o.template) && !this.custom) this.style = s.s;
      this.savedView = s.v;
      this._classes();
    }
    /* ---------------- visible tree ---------------- */
    _visible() {
      const out = [];
      let base = this.viewRoot ? [this.viewRoot] : this.roots;
      if (this.savedView) {
        const v = this.nodes.get(this.savedView);
        if (v) {
          this.viewRoot = v;
          base = [v];
        }
        this.savedView = null;
      }
      const keep = this.onlyHl ? this._keepSet() : null;
      if (keep) base = base.filter((n) => keep.has(n));
      const st = [];
      for (let i = base.length - 1; i >= 0; i--) st.push([base[i], 0, null]);
      while (st.length) {
        const [n, d, vp] = st.pop();
        n.vd = d;
        n.vp = vp;
        out.push(n);
        let shown = [];
        const kids = keep ? n.kids.filter((k) => keep.has(k)) : n.kids;
        if ((keep || n.exp) && kids.length && !n.more) {
          shown = kids.slice(0, n.lim);
          if (kids.length > n.lim) {
            let m = this.moreNodes.get(n.id);
            if (!m) {
              m = { id: "more:" + n.id, more: true, parent: n, kids: [], exp: false };
              this.moreNodes.set(n.id, m);
            }
            m.remaining = kids.length - n.lim;
            shown.push(m);
          }
        }
        n.shown = shown;
        for (let i = shown.length - 1; i >= 0; i--) st.push([shown[i], d + 1, n]);
      }
      return out;
    }
    /* ---------------- node markup ---------------- */
    _cell(n, role) {
      const v = this._v(n, role);
      if (isBlank(v)) return "";
      const i = this.ci[role];
      return i >= 0 && this.rawSet.has(this.cols[i]) ? String(v) : esc(v);
    }
    _plain(n, role) {
      const v = this._v(n, role);
      return isBlank(v) ? "" : stripTags(v);
    }
    _img(n) {
      if (n.virt || this.o.photos === false) return null;
      const u = safeUrl(this._v(n, "image"));
      if (u) return u;
      if (this.o.imageBlob && window.apex && apex.server && apex.server.pluginUrl) {
        return apex.server.pluginUrl(this.o.ajaxId, { x01: "IMG", x02: n.id });
      }
      return null;
    }
    _avatar(n, size) {
      const t = this._plain(n, "title");
      const ic = safeClass(this._v(n, "icon"));
      const img = this._img(n);
      const hue = hashHue(t);
      if (n.virt) return `<span class="hcp-av ${size} hcp-av--ic">${icon("users")}</span>`;
      if (!img && ic) return `<span class="hcp-av ${size} hcp-av--ic"><span class="fa ${ic}" aria-hidden="true"></span></span>`;
      return `<span class="hcp-av ${size}" style="--hcp-avh:${hue}"><span class="hcp-ini" aria-hidden="true">${esc(initials(t))}</span>` + (img ? `<img src="${esc(img)}" alt="" loading="lazy" decoding="async">` : "") + "</span>";
    }
    // badges take the node's colour
    _badge(n) {
      const b = this._cell(n, "badge");
      return b ? `<span class="hcp-badge">${b}</span>` : "";
    }
    // one chip per badge value ("Remote; Contractor")
    _badgeChips(n) {
      const v = this._v(n, "badge");
      if (isBlank(v)) return "";
      const raw = this.rawSet.has(this.cols[this.ci.badge]);
      return splitChips(raw ? v : stripTags(v)).map((t) => `<span class="hcp-chip">${raw ? t : esc(t)}</span>`).join("");
    }
    // the Footer Column: its own section at the foot of the card, below the team and roll-up totals
    _footer(n) {
      if (!this._show("footer")) return "";
      const v = this._cell(n, "footer");
      return v ? `<div class="hcp-foot"${this.o.footerLabel ? ` title="${esc(this.o.footerLabel)}"` : ""}>${v}</div>` : "";
    }
    // the Highlight Column: Y / 1 / true = highlighted; any other text (except N / 0) is a status such
    // as "Absent" - shown as a chip. The colour comes from the Highlight Color Column of the same row
    // (red, amber, #16a34a ...); without one each status gets a fixed colour of its own.
    _flag(n) {
      if (n.hli !== void 0) return n.hli;
      const v = n.virt ? null : this._v(n, "highlight");
      let f = null;
      if (!isBlank(v) && v !== false) {
        const s = stripTags(String(v)).trim();
        const c = namedColor(this._v(n, "statusColor"));
        if (/^(y|yes|1|true)$/i.test(s)) f = { label: null, color: c };
        else if (s && !/^(n|no|0|false)$/i.test(s)) f = { label: s, color: c || AUTO_STATUS[hashHue(s.toLowerCase()) % AUTO_STATUS.length] };
      }
      return n.hli = f;
    }
    _status(n) {
      const f = this._flag(n);
      return f && f.label ? `<span class="hcp-status"><i aria-hidden="true"></i>${esc(f.label)}</span>` : "";
    }
    // highlighted nodes (or those of the chosen status) plus every ancestor
    _keepSet() {
      const keep = /* @__PURE__ */ new Set();
      const sf = this.stFilter;
      for (const n of this.nodes.values()) {
        const f = this._flag(n);
        const hit = sf ? !!f && f.label === sf : !!f || this.hl.has(n.id);
        if (!hit) continue;
        for (let c = n; c && !keep.has(c); c = c.parent) keep.add(c);
      }
      return keep;
    }
    showHighlightedOnly(on) {
      on = !!on;
      if (on && !this._keepSet().size) {
        this._showToast(this.msg.NO_HL);
        on = false;
      }
      this.onlyHl = on;
      this._classes();
      const b = this.el.querySelector('[data-act="onlyHl"]');
      if (b) {
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
        b.title = on ? this.msg.SHOW_ALL : this.msg.ONLY_HL;
        b.setAttribute("aria-label", b.title);
      }
      if (!this.nodes.size) return;
      this.update({ animate: true });
      this.fit();
    }
    _icon(n) {
      const ic = safeClass(this._v(n, "icon"));
      return ic ? `<span class="hcp-icon fa ${ic}" aria-hidden="true"></span>` : "";
    }
    // the body: label / value rows of Body Columns 1-4 (label = the column heading), minus any a user switched off
    _fieldsHtml(n) {
      const off = new Set(this.o.hiddenFields || []);
      let h = "";
      for (const f of this.fields) {
        const v = n.r ? n.r[f.i] : null;
        if (isBlank(v) || off.has(f.c)) continue;
        const plain = stripTags(v);
        h += `<div class="hcp-fr"><dt title="${esc(f.l)}">${esc(f.l)}</dt><dd title="${esc(plain)}">${f.raw ? String(v) : esc(v)}</dd></div>`;
      }
      return h ? `<dl class="hcp-fl">${h}</dl>` : "";
    }
    // team size and roll-up total (inline = the small form for pill and minimal)
    _meta(n, inline) {
      const h = this.o.showTotals !== false && !(n.virt && !n.desc) ? this._totals(n, inline) : "";
      if (!h) return "";
      return inline ? `<span class="hcp-meta hcp-meta--in">${h}</span>` : `<div class="hcp-meta">${h}</div>`;
    }
    _totals(n, inline) {
      let h = "";
      const team = n.desc || (this.lazy && !n.loaded ? n.cc || 0 : 0);
      if (team > 0) {
        h += `<span class="hcp-team" title="${esc(fmt(this.msg.TEAM, this.kidCount(n), team))}">${icon("users")}${this._num(team)}</span>`;
      }
      if (this.ci.rollup >= 0 && n.roll) {
        const lbl = this.o.rollupLabel || "";
        h += `<span class="hcp-roll" title="${esc((lbl ? lbl + " " : "") + this._num(n.roll))}">${lbl && !inline ? esc(lbl) + " " : ""}<b>${esc(this._num(n.roll, inline))}</b></span>`;
      }
      return h;
    }
    // short = compact notation (2.9M) for the small inline totals
    _num(v, short) {
      try {
        const f = this.numFmt = this.numFmt || {};
        const k = short ? "s" : "l";
        if (!f[k]) {
          f[k] = new Intl.NumberFormat(
            document.documentElement.lang || void 0,
            short ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 2 }
          );
        }
        return f[k].format(v);
      } catch (e) {
        return String(v);
      }
    }
    // One card. Every view shows the title and the team / roll-up totals; the rest follows SLOTS
    // and the card content switches (subtitle, badge, status, totals, body).
    _inner(n) {
      const s = this.style;
      const T = this._cell(n, "title") || (n.virt ? esc(n.vt) : "");
      const S = this._show("subtitle") ? this._cell(n, "subtitle") : "";
      const t = `<div class="hcp-t">${T}</div>`;
      const st = S ? `<div class="hcp-st">${S}</div>` : "";
      const sts = this._show("status") ? this._status(n) : "";
      const stl = sts ? `<div class="hcp-stl">${sts}</div>` : "";
      const bdg = this._show("badge") ? this._badge(n) : "";
      const meta = this._meta(n);
      const foot = this._footer(n);
      const body = this._show("body") ? this._fieldsHtml(n) : "";
      switch (s) {
        case "CLASSIC":
          return `<div class="hcp-card">${bdg}<div class="hcp-tx">${this._icon(n)}${t}${st}${stl}</div>${meta}${foot}</div>`;
        case "DETAILED":
          return `<div class="hcp-card"><div class="hcp-hd">${this._avatar(n, "hcp-av--md")}<div class="hcp-tx">${t}${st}${stl}</div>${bdg}</div>` + body + meta + foot + "</div>";
        case "PILL":
          return `<div class="hcp-card">${this._avatar(n, "hcp-av--sm")}<span class="hcp-t">${T}</span>${this._meta(n, true)}${bdg}</div>`;
        case "BUBBLE":
          return `<div class="hcp-card">${this._avatar(n, "hcp-av--xl")}${bdg}${t}${st}${stl}${meta}${foot}</div>`;
        case "HEADER": {
          const c = safeColor(this._v(n, "color"));
          const lum = luminance(c);
          return `<div class="hcp-card"><div class="hcp-band${lum !== null && lum > 0.55 ? " hcp-band--light" : ""}">${t}${bdg}</div><div class="hcp-body">${this._avatar(n, "hcp-av--md")}<div class="hcp-tx">${st || (sts ? "" : "&nbsp;")}${stl}</div></div>` + body + meta + foot + "</div>";
        }
        case "MINIMAL":
          return `<div class="hcp-card">${this._avatar(n, "hcp-av--md")}<div class="hcp-tx">${t}${st}${stl}${this._meta(n, true)}${foot}</div>${bdg}</div>`;
        case "BADGE": {
          const chips = sts + (this._show("badge") ? this._badgeChips(n) : "");
          return `<div class="hcp-card"><div class="hcp-hd">${this._avatar(n, "hcp-av--md")}<div class="hcp-tx">${t}${st}</div></div>` + (chips ? `<div class="hcp-chips">${chips}</div>` : "") + meta + foot + "</div>";
        }
        case "PHOTO":
          return `<div class="hcp-card"><div class="hcp-ph">${this._avatar(n, "hcp-av--ph")}${bdg}</div><div class="hcp-tx">${t}${st}${stl}</div>${meta}${foot}</div>`;
        case "CUSTOM":
          return `<div class="hcp-card hcp-custom">${this._template(n)}</div>`;
        default:
          return `<div class="hcp-card">${bdg}${this._avatar(n, "hcp-av--lg")}<div class="hcp-tx">${t}${st}${stl}</div>${meta}${foot}</div>`;
      }
    }
    _template(n) {
      const tokens = {
        ID: () => esc(n.id),
        TITLE: () => this._cell(n, "title") || (n.virt ? esc(n.vt) : ""),
        SUBTITLE: () => this._show("subtitle") ? this._cell(n, "subtitle") : "",
        IMAGE: () => this._avatar(n, "hcp-av--md"),
        AVATAR: () => this._avatar(n, "hcp-av--md"),
        ICON: () => this._icon(n),
        BADGE: () => this._show("badge") ? this._badge(n) : "",
        BADGES: () => this._show("badge") ? this._badgeChips(n) : "",
        STATUS: () => this._show("status") ? this._status(n) : "",
        TOTALS: () => this._meta(n),
        FOOTER: () => this._footer(n),
        COLOR: () => esc(safeColor(this._v(n, "color")) || ""),
        FIELDS: () => this._show("body") ? this._fieldsHtml(n) : "",
        CHILD_COUNT: () => String(this.kidCount(n)),
        DESC_COUNT: () => String(n.desc || 0),
        ROLLUP: () => esc(this._num(n.roll || 0)),
        LEVEL: () => String((n.depth || 0) + 1)
      };
      return String(this.o.template || "").replace(/&([A-Z0-9_$#]+)\./g, (m, k) => {
        if (tokens[k]) return tokens[k]();
        const i = this.cols.indexOf(k);
        if (i < 0 || !n.r) return i < 0 ? m : "";
        const v = n.r[i];
        return isBlank(v) ? "" : this.rawSet.has(k) ? String(v) : esc(v);
      });
    }
    _nodeHtml(n) {
      if (n.more) {
        return `<div class="hcp-node hcp-morenode" role="treeitem" tabindex="-1" data-id="${esc(n.id)}" style="width:${MORE_WIDTH}px"><div class="hcp-card"><span class="hcp-t"></span></div></div>`;
      }
      const color2 = safeColor(this._v(n, "color"));
      const flag = this._flag(n);
      let tip = [this._plain(n, "title"), this._plain(n, "subtitle")].filter(Boolean).join(" \u2013 ") + (flag && flag.label ? " \xB7 " + flag.label : "");
      const link = !isBlank(this._v(n, "link"));
      let extra = "", lcls = "";
      if (link) {
        for (const [k, v] of this.linkAttrs.attrs) {
          if (k === "class") lcls += " " + safeClass(v);
          else if (k === "title") tip = v;
          else if (k !== "rel") extra += ` ${k}="${esc(v)}"`;
        }
      }
      const cls = ["hcp-node", flag ? "hcp-flag" : "", n.virt ? "hcp-virt" : "", link ? "hcp-haslink" : "", lcls].join(" ").replace(/\s+/g, " ").trim();
      let style = `width:${this.nodeW}px;`;
      if (this.o.nodeHeight) style += `height:${+this.o.nodeHeight}px;`;
      if (color2) style += `--hcp-accent:${color2};`;
      if (flag && flag.color) style += `--hcp-flag:${flag.color};`;
      return `<div class="${cls}" role="treeitem" tabindex="-1" data-id="${esc(n.id)}" style="${style}"${tip ? ` title="${esc(tip)}"` : ""}${extra}>` + this._inner(n) + '<span class="hcp-tg" aria-hidden="true"></span></div>';
    }
    _syncNode(n) {
      const el = n.el;
      if (!el) return;
      if (n.more) {
        el.querySelector(".hcp-t").textContent = fmt(this.msg.MORE, n.remaining.toLocaleString());
        el.setAttribute("aria-label", fmt(this.msg.MORE, n.remaining));
        el.setAttribute("aria-level", n.vd + 1);
        return;
      }
      const has = this.hasKids(n);
      const tg = el.querySelector(".hcp-tg");
      el.classList.toggle("hcp-parent", has);
      el.classList.toggle("hcp-open", has && n.exp);
      if (has) {
        el.setAttribute("aria-expanded", n.exp ? "true" : "false");
        const c = this.kidCount(n);
        tg.textContent = n.exp ? "\u2212" : "+" + (c > 999 ? Math.round(c / 100) / 10 + "k" : c);
        tg.title = (n.exp ? this.msg.COLLAPSE : this.msg.EXPAND) + " \u2013 " + fmt(this.msg.TEAM, c, n.desc || c);
        if (!n.exp && n.hlc > 0) {
          const b = document.createElement("b");
          b.className = "hcp-tgh";
          b.textContent = n.hlc > 999 ? Math.round(n.hlc / 100) / 10 + "k" : n.hlc;
          tg.appendChild(b);
          tg.title += " \u2013 " + fmt(this.msg.HL_BRANCH, n.hlc);
        }
      } else el.removeAttribute("aria-expanded");
      el.classList.toggle("hcp-loading", !!n.loading);
      el.setAttribute("aria-level", n.vd + 1);
      const label = [this._plain(n, "title") || n.vt, this._plain(n, "subtitle")].filter(Boolean).join(", ");
      el.setAttribute("aria-label", label);
      el.setAttribute("aria-selected", this.sel === n ? "true" : "false");
      el.classList.toggle("hcp-sel", this.sel === n);
    }
    get nodeW() {
      return +this.o.nodeWidth || STYLE_WIDTH[this.style] || 210;
    }
    /* ---------------- render pipeline ---------------- */
    _measureVp() {
      this.vw = this.vp.clientWidth;
      this.vh = this.vp.clientHeight;
    }
    _render(isData) {
      this._measureVp();
      if (!this.vw || !this.vh) {
        this.pending = true;
        return;
      }
      this.pending = false;
      if (!this.nodes.size) {
        this._clearDom();
        this._showMsg(this.o.noDataMessage || this.msg.NO_DATA);
        this._legend();
        return;
      }
      this.msgEl.hidden = true;
      this.update({ animate: !isData || !!this.didRender });
      if (isData) {
        this._syncSwitches();
        this._cfgSync();
        this._legend();
        if (!this.didRender) {
          this.didRender = true;
          this._initialView();
        }
        if (this.qEl && this.qEl.value) this.search(this.qEl.value, true);
        this._fire("after_render", { nodeCount: this.nodes.size, visibleCount: this.V.length });
      }
    }
    _clearDom() {
      this.layer.textContent = "";
      this.gLinks.textContent = "";
      this.gPanels.textContent = "";
      this.gBands.textContent = "";
      this.linkEls.clear();
      this.panelEls.clear();
      for (const n of this.nodes.values()) {
        n.el = null;
        n.cur = null;
      }
      for (const m of this.moreNodes.values()) {
        m.el = null;
        m.cur = null;
      }
      this.V = [];
    }
    _showMsg(text, detail) {
      this.msgEl.hidden = false;
      this.msgEl.innerHTML = `<div class="hcp-msg-in">${detail ? icon("warn") : ""}<p>${esc(text)}</p>${detail && this._debug() ? `<pre>${esc(detail).slice(0, 2e3)}</pre>` : ""}</div>`;
    }
    _debug() {
      return !!(window.apex && apex.debug && apex.debug.getLevel && apex.debug.getLevel() > 0) || !!this.o.dataProvider;
    }
    /**
     * Re-layout and re-draw. opts.anchor keeps that node visually still.
     */
    update(opts) {
      opts = opts || {};
      if (this.anim) this._finishAnim();
      const prevV = this.V;
      const V = this.V = this._visible();
      const inV = new Set(V);
      let html = "";
      const fresh = [];
      for (const n of V) {
        if (!n.el) {
          html += this._nodeHtml(n);
          fresh.push(n);
        }
      }
      if (fresh.length) {
        const tpl = document.createElement("template");
        tpl.innerHTML = html;
        const els = Array.from(tpl.content.children);
        els.forEach((e, i) => {
          const n = fresh[i];
          n.el = e;
          e._hcp = n;
          e.classList.add("hcp-enter");
          n.w = n.h = null;
        });
        this.layer.appendChild(tpl.content);
      }
      for (const n of V) {
        if (n.el.style.display === "none") {
          n.el.style.display = "";
          n.culled = false;
        }
        this._syncNode(n);
      }
      for (const n of V) {
        if (n.w === null || n.w === void 0) {
          n.w = n.el.offsetWidth;
          n.h = n.el.offsetHeight;
        }
      }
      const anchor = opts.anchor && opts.anchor.cur ? { n: opts.anchor, x: opts.anchor.cur.x, y: opts.anchor.cur.y } : null;
      this._layout(V);
      if (anchor && anchor.n.box) {
        const dx = anchor.x - anchor.n.box.x, dy = anchor.y - anchor.n.box.y;
        for (const n of V) {
          n.box.x += dx;
          n.box.y += dy;
        }
        this.L.shift = { dx, dy };
      } else this.L.shift = null;
      this._bounds(V);
      const exiting = prevV.filter((n) => !inV.has(n) && n.el);
      for (const n of V) {
        if (n.vp && !this.linkEls.has(n.id)) {
          const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
          p.setAttribute("class", "hcp-lk");
          this.gLinks.appendChild(p);
          this.linkEls.set(n.id, p);
        }
      }
      for (const n of fresh) {
        const p = n.vp;
        if (n.keep) n.cur = n.keep;
        else if (p && p.cur && opts.animate !== false) {
          n.cur = { x: p.cur.x + (p.w - n.w) / 2, y: p.cur.y + (p.h - n.h) / 2 };
        } else n.cur = null;
      }
      const dur = this._duration(opts, V.length + exiting.length);
      requestAnimationFrame(() => fresh.forEach((n) => n.el && n.el.classList.remove("hcp-enter")));
      this._animate(V, exiting, dur, () => {
        this._bands();
        this._aria(V);
        this._cull();
        this._drawMini();
        this._applyMarks();
      });
      if (opts.fit) this.fit(0);
      this._crumbs();
    }
    _duration(opts, count2) {
      if (opts.animate === false || !this.o.animate || count2 > 1800) return 0;
      if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
      return this.o.duration;
    }
    _aria(V) {
      for (const n of V) {
        const sib = n.vp ? n.vp.shown : V.filter((x) => x.vd === 0);
        n.el.setAttribute("aria-setsize", sib.length);
        n.el.setAttribute("aria-posinset", sib.indexOf(n) + 1);
      }
      const f = this.focusId && this._get(this.focusId) || this.sel || V[0];
      V.forEach((n) => n.el.tabIndex = n === f ? 0 : -1);
      if (f && !V.includes(f) && V[0]) V[0].el.tabIndex = 0;
    }
    _get(id2) {
      if (id2 === null || id2 === void 0) return null;
      id2 = String(id2);
      return this.nodes.get(id2) || (id2.indexOf("more:") === 0 ? this.moreNodes.get(id2.slice(6)) : null);
    }
    _byEl(el) {
      return el && el._hcp ? el._hcp : null;
    }
    /* ---------------- layout ---------------- */
    _layout(V) {
      if (this.eo === "RADIAL") return this._layoutRadial(V);
      const o = this.o;
      const horiz = this.eo === "LR" || this.eo === "RL";
      const B = (n) => horiz ? n.h : n.w;
      const D = (n) => horiz ? n.w : n.h;
      const gap = +o.siblingGap || 0;
      const lg = +o.levelGap || 0;
      for (const n of V) n.grp = null;
      for (const n of V) if (n.shown.length) n.grp = this._groupMode(n, horiz);
      const layer = [];
      for (const n of V) {
        const s = D(n);
        if (!(layer[n.vd] >= s)) layer[n.vd] = s;
      }
      const dpos = [0];
      for (let i = 1; i <= layer.length; i++) dpos[i] = dpos[i - 1] + (layer[i - 1] || 0) + lg;
      const layerAt = (y) => {
        let i = 0;
        while (i + 1 < dpos.length && dpos[i + 1] - lg / 2 <= y) i++;
        return i;
      };
      for (let i = V.length - 1; i >= 0; i--) {
        const n = V[i];
        const b = B(n);
        const cont = [[-b / 2, b / 2]];
        n.ty = dpos[n.vd];
        const kids = n.shown;
        if (kids.length) {
          if (n.grp) {
            const ext = this._groupLayout(n, kids, dpos, B, D, gap);
            const last = layerAt(n.gbox.y1);
            for (let L = n.vd + 1; L <= Math.max(last, n.vd + 1); L++) cont[L - n.vd] = [ext[0], ext[1]];
          } else {
            const { offs: offs2, acc } = pack(kids.map((k) => k.cont), gap);
            const c = (offs2[0] + offs2[offs2.length - 1]) / 2;
            kids.forEach((k, j) => k.rx = offs2[j] - c);
            acc.forEach((s, k) => cont[k + 1] = [s[0] - c, s[1] - c]);
          }
        }
        n.cont = cont;
      }
      const roots = V.filter((n) => n.vd === 0);
      const { offs } = pack(roots.map((r) => r.cont), gap * 2);
      roots.forEach((r, j) => r.ax = offs[j]);
      for (const n of V) if (n.vp) n.ax = n.vp.ax + n.rx;
      const mir = this.rtl && !horiz ? -1 : 1;
      for (const n of V) {
        const ax = n.ax * mir;
        let x, y;
        switch (this.eo) {
          case "BT":
            x = ax - n.w / 2;
            y = -(n.ty + n.h);
            break;
          case "LR":
            x = n.ty;
            y = ax - n.h / 2;
            break;
          case "RL":
            x = -(n.ty + n.w);
            y = ax - n.h / 2;
            break;
          default:
            x = ax - n.w / 2;
            y = n.ty;
        }
        n.box = { x, y };
      }
      this.L = { dpos, layer, horiz, lg };
    }
    _groupMode(n, horiz) {
      const kids = n.shown;
      if (kids.length < 2) return null;
      for (const k of kids) if (this.onlyHl ? k.shown && k.shown.length : this.hasKids(k)) return null;
      const m = this.o.leafLayout;
      if (m === "ROW") return null;
      if (horiz) return (m === "AUTO" ? kids.length > 8 : kids.length > 3) ? "grid" : null;
      if (m === "STACK") return "stack";
      if (m === "GRID") return kids.length > 3 ? "grid" : "stack";
      return kids.length <= 3 ? null : kids.length <= 8 ? "stack" : "grid";
    }
    // Places leaf children of n as a two-sided stack or a grid panel.
    // Returns breadth extents relative to n; sets kid.rx / kid.ty and n.gbox.
    _groupLayout(n, kids, dpos, B, D, gap) {
      const y0 = dpos[n.vd + 1];
      if (n.grp === "stack") {
        const sp = Math.max(16, gap * 0.75);
        const vg = Math.max(10, gap * 0.5);
        let y2 = y0, mL = 0, mR = 0;
        for (let i = 0; i < kids.length; i += 2) {
          const a = kids[i], b = kids[i + 1];
          const h = Math.max(D(a), b ? D(b) : 0);
          a.rx = -(sp + B(a) / 2);
          a.ty = y2;
          mL = Math.max(mL, B(a));
          if (b) {
            b.rx = sp + B(b) / 2;
            b.ty = y2;
            mR = Math.max(mR, B(b));
          }
          y2 += h + vg;
        }
        n.gbox = { kind: "stack", y0, y1: y2 - vg };
        return [-(sp + mL), sp + mR];
      }
      const cnt = kids.length;
      const cols = Math.min(cnt, Math.max(2, Math.round(Math.sqrt(cnt * 1.6))));
      const cw = Math.max(...kids.map(B));
      const gx = Math.max(10, gap * 0.5), pad = 14;
      const W = cols * cw + (cols - 1) * gx + 2 * pad;
      let y = y0 + pad;
      for (let r = 0; r * cols < cnt; r++) {
        const row = kids.slice(r * cols, r * cols + cols);
        const h = Math.max(...row.map(D));
        row.forEach((k, c) => {
          k.rx = -W / 2 + pad + c * (cw + gx) + cw / 2;
          k.ty = y;
        });
        y += h + gx;
      }
      n.gbox = { kind: "grid", y0, y1: y - gx + pad, w: W };
      return [-W / 2, W / 2];
    }
    _layoutRadial(V) {
      const o = this.o;
      const roots = V.filter((n) => n.vd === 0);
      const single = roots.length === 1;
      const vroot = { __v: true, shown: roots };
      const h = hierarchy(vroot, (d) => d.shown && d.shown.length ? d.shown : null);
      tree_default().size([2 * Math.PI, 1]).separation((a, b) => (a.parent === b.parent ? 1 : 1.6) / Math.max(1, a.depth))(h);
      const maxS = Math.max(...V.map((n) => Math.max(n.w, n.h)));
      const ang = [];
      h.each((d) => {
        if (d.data.__v) return;
        const k = d.depth - (single ? 1 : 0);
        (ang[k] = ang[k] || []).push(d.x);
      });
      const r = [0];
      for (let d = 1; d < ang.length; d++) {
        const a = (ang[d] || []).slice().sort((x, y) => x - y);
        let minGap = 2 * Math.PI;
        for (let i = 1; i < a.length; i++) minGap = Math.min(minGap, a[i] - a[i - 1]);
        if (a.length > 1) minGap = Math.min(minGap, 2 * Math.PI - a[a.length - 1] + a[0]);
        const need = a.length > 1 ? (maxS + (+o.siblingGap || 0)) / Math.max(minGap, 1e-3) : 0;
        r[d] = Math.max(r[d - 1] + maxS + (+o.levelGap || 40) * 0.6, need);
      }
      const mir = this.rtl ? -1 : 1;
      h.each((d) => {
        if (d.data.__v) return;
        const n = d.data;
        const k = d.depth - (single ? 1 : 0);
        const rr = r[k] || 0;
        const th = d.x;
        const cx = mir * rr * Math.sin(th), cy = -rr * Math.cos(th);
        n.box = { x: cx - n.w / 2, y: cy - n.h / 2 };
        n.grp = null;
      });
      this.L = { radial: true, lg: +o.levelGap || 40 };
    }
    _bounds(V) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const n of V) {
        const b = n.box;
        if (b.x < x0) x0 = b.x;
        if (b.y < y0) y0 = b.y;
        if (b.x + n.w > x1) x1 = b.x + n.w;
        if (b.y + n.h > y1) y1 = b.y + n.h;
      }
      const m = 14;
      this.bounds = { x0: x0 - m, y0: y0 - m, x1: x1 + m, y1: y1 + m };
      if (this._bandsOn() && !this.L.radial) {
        if (this.L.horiz) this.bounds.y0 -= 30;
        else if (this.rtl) this.bounds.x1 += 110;
        else this.bounds.x0 -= 110;
      }
    }
    /* ---------------- links ---------------- */
    _P(a, b, horiz) {
      return horiz ? r1(a) + "," + r1(b) : r1(b) + "," + r1(a);
    }
    _linkPath(p, c) {
      const st = this.o.connector;
      const pc = p.cur, cc = c.cur;
      if (!pc || !cc) return "";
      if (this.L.radial) return this._radialPath(p, c);
      const horiz = this.L.horiz;
      const s = this.eo === "TB" || this.eo === "LR" ? 1 : -1;
      const P = (a, b) => this._P(a, b, horiz);
      const pa = horiz ? s > 0 ? pc.x + p.w : pc.x : s > 0 ? pc.y + p.h : pc.y;
      const pb = horiz ? pc.y + p.h / 2 : pc.x + p.w / 2;
      const rad = st === "ROUNDED" ? 10 : st === "ELBOW" ? 0 : -1;
      if (p.grp === "stack") {
        const ia = cc.y + c.h / 2;
        const left = cc.x + c.w / 2 < pb;
        const e = left ? cc.x + c.w : cc.x;
        return elbow2(pa, pb, ia, e, Math.max(rad, 0), P);
      }
      if (p.grp === "grid") {
        if (p.shown[0] !== c) return "";
        const pr = this._panelRect(p);
        const top = horiz ? s > 0 ? pr.x : pr.x + pr.w : s > 0 ? pr.y : pr.y + pr.h;
        return "M" + P(pa, pb) + "L" + P(top, pb);
      }
      const ca = horiz ? s > 0 ? cc.x : cc.x + c.w : s > 0 ? cc.y : cc.y + c.h;
      const cb = horiz ? cc.y + c.h / 2 : cc.x + c.w / 2;
      if (st === "STRAIGHT") return "M" + P(pa, pb) + "L" + P(ca, cb);
      if (st === "CURVED") {
        const m2 = (pa + ca) / 2;
        return "M" + P(pa, pb) + "C" + P(m2, pb) + " " + P(m2, cb) + " " + P(ca, cb);
      }
      const m = ca - s * this.L.lg / 2;
      return elbow3(pa, pb, m, ca, cb, rad, P);
    }
    _radialPath(p, c) {
      const st = this.o.connector;
      const a = { x: p.cur.x + p.w / 2, y: p.cur.y + p.h / 2 };
      const b = { x: c.cur.x + c.w / 2, y: c.cur.y + c.h / 2 };
      const pt = (v) => r1(v.x) + "," + r1(v.y);
      if (st === "STRAIGHT") return "M" + pt(a) + "L" + pt(b);
      const ra = Math.hypot(a.x, a.y), rb = Math.hypot(b.x, b.y);
      if (ra < 1) return "M" + pt(a) + "L" + pt(b);
      const ta = Math.atan2(a.x, -a.y), tb = Math.atan2(b.x, -b.y);
      const rm = (ra + rb) / 2;
      const pol = (t, r) => ({ x: r * Math.sin(t), y: -r * Math.cos(t) });
      return "M" + pt(a) + "C" + pt(pol(ta, rm)) + " " + pt(pol(tb, rm)) + " " + pt(b);
    }
    _panelRect(p) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const k of p.shown) {
        const c = k.cur;
        if (!c) continue;
        x0 = Math.min(x0, c.x);
        y0 = Math.min(y0, c.y);
        x1 = Math.max(x1, c.x + k.w);
        y1 = Math.max(y1, c.y + k.h);
      }
      const pad = 14;
      return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
    }
    _drawLinks() {
      for (const [id2, el] of this.linkEls) {
        const c = this._get(id2);
        const p = c && (c.vp || c.parent);
        el.setAttribute("d", c && p && c.el ? this._linkPath(p, c) : "");
      }
      const want = /* @__PURE__ */ new Set();
      for (const n of this.V) {
        if (n.grp !== "grid") continue;
        want.add(n.id);
        let r = this.panelEls.get(n.id);
        if (!r) {
          r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          r.setAttribute("class", "hcp-panel");
          r.setAttribute("rx", 14);
          this.gPanels.appendChild(r);
          this.panelEls.set(n.id, r);
        }
        const pr = this._panelRect(n);
        r.setAttribute("x", r1(pr.x));
        r.setAttribute("y", r1(pr.y));
        r.setAttribute("width", r1(Math.max(0, pr.w)));
        r.setAttribute("height", r1(Math.max(0, pr.h)));
      }
      for (const [id2, r] of this.panelEls) if (!want.has(id2)) {
        r.remove();
        this.panelEls.delete(id2);
      }
    }
    /* ---------------- animation ---------------- */
    _animate(V, exiting, dur, done) {
      const movers = [];
      const tx = (el, x, y) => el.style.transform = `translate(${r1(x)}px,${r1(y)}px)`;
      for (const n of V) {
        if (!n.cur) n.cur = { x: n.box.x, y: n.box.y };
        movers.push({ n, fx: n.cur.x, fy: n.cur.y, tx: n.box.x, ty: n.box.y });
      }
      for (const n of exiting) {
        let anc = n.vp;
        while (anc && !V.includes(anc)) anc = anc.vp;
        const t = anc ? { x: anc.box.x + (anc.w - n.w) / 2, y: anc.box.y + (anc.h - n.h) / 2 } : n.cur;
        n.el.classList.add("hcp-exit");
        if (n.cur) movers.push({ n, fx: n.cur.x, fy: n.cur.y, tx: t.x, ty: t.y, exit: true });
      }
      const finish = () => {
        for (const m of movers) {
          m.n.cur = { x: m.tx, y: m.ty };
          if (m.exit) {
            if (m.n.el) m.n.el.remove();
            m.n.el = null;
            m.n.cur = null;
            const l = this.linkEls.get(m.n.id);
            if (l) {
              l.remove();
              this.linkEls.delete(m.n.id);
            }
          } else if (m.n.el) tx(m.n.el, m.tx, m.ty);
        }
        const vis = new Set(V.map((n) => n.id));
        for (const [id3, l] of this.linkEls) if (!vis.has(id3)) {
          l.remove();
          this.linkEls.delete(id3);
        }
        this.anim = null;
        this._drawLinks();
        done && done();
      };
      if (!dur) {
        this.anim = { finish };
        return this._finishAnim();
      }
      const t0 = performance.now();
      const frame2 = (now2) => {
        if (!this.anim || this.anim.id !== id2) return;
        const e = Math.min(1, (now2 - t0) / dur);
        const k = easeInOut(e);
        for (const m of movers) {
          const x = m.fx + (m.tx - m.fx) * k, y = m.fy + (m.ty - m.fy) * k;
          m.n.cur = { x, y };
          if (m.n.el) tx(m.n.el, x, y);
        }
        this._drawLinks();
        if (e < 1) this.anim.raf = requestAnimationFrame(frame2);
        else finish();
      };
      const id2 = {};
      this.anim = { id: id2, finish, raf: requestAnimationFrame(frame2) };
    }
    _finishAnim() {
      const a = this.anim;
      if (!a) return;
      if (a.raf) cancelAnimationFrame(a.raf);
      a.finish();
    }
    /* ---------------- bands / legend / minimap ---------------- */
    _bandsOn() {
      return !!this.o.levelBands || this.ci.levelName >= 0;
    }
    _bands() {
      const g = this.gBands;
      g.textContent = "";
      if (!this._bandsOn() || !this.L || this.L.radial) {
        this.bandList = null;
        return this._placeBands();
      }
      const { dpos, layer, horiz, lg } = this.L;
      const sh = this.L.shift || { dx: 0, dy: 0 };
      const b = this.bounds;
      const s = this.eo === "TB" || this.eo === "LR" ? 1 : -1;
      const labels = [];
      for (const n of this.V) if (!labels[n.vd]) labels[n.vd] = this._plain(n, "levelName");
      let h = "";
      const list = [];
      for (let i = 0; i < layer.length; i++) {
        const a0 = dpos[i] - lg / 2, a1 = dpos[i] + layer[i] + lg / 2;
        const size = a1 - a0;
        const at = (s > 0 ? a0 : -a1) + (horiz ? sh.dx : sh.dy);
        list.push({ at, size, label: labels[i] || fmt(this.msg.LEVEL, i + 1) });
        h += horiz ? `<rect class="hcp-band hcp-band--${i % 2}" x="${r1(at)}" y="${r1(b.y0)}" width="${r1(size)}" height="${r1(b.y1 - b.y0)}"/>` : `<rect class="hcp-band hcp-band--${i % 2}" x="${r1(b.x0)}" y="${r1(at)}" width="${r1(b.x1 - b.x0)}" height="${r1(size)}"/>`;
      }
      g.innerHTML = h;
      this.bandList = list;
      let ov = this.vp.querySelector(".hcp-blabels");
      if (!ov) {
        ov = document.createElement("div");
        ov.className = "hcp-blabels";
        ov.setAttribute("aria-hidden", "true");
        this.vp.insertBefore(ov, this.legendEl);
      }
      ov.innerHTML = list.map((x) => `<span class="hcp-bl">${esc(x.label)}</span>`).join("");
      this._placeBands();
    }
    _placeBands() {
      const ov = this.vp.querySelector(".hcp-blabels");
      if (!ov) return;
      const on = this._bandsOn() && this.L && !this.L.radial && this.bandList;
      ov.hidden = !on;
      if (!on) return;
      const t = this.t;
      const horiz = this.L.horiz;
      ov.classList.toggle("hcp-blabels--h", horiz);
      Array.from(ov.children).forEach((el, i) => {
        const b = this.bandList[i];
        if (!b) return;
        if (horiz) {
          el.style.transform = `translate(${r1((b.at + b.size / 2) * t.k + t.x)}px,0) translateX(-50%)`;
          el.classList.add("hcp-bl--top");
        } else {
          el.style.top = r1(b.at * t.k + t.y + 6) + "px";
          el.classList.remove("hcp-bl--top");
        }
      });
    }
    _legend() {
      const lg = this.legendMap;
      const sm = this.statusMap;
      const el = this.legendEl;
      if (!this.o.legend || (!lg || !lg.size) && (!sm || !sm.size)) {
        el.hidden = true;
        return;
      }
      let h = "";
      for (const [l, s] of sm || []) {
        h += `<button type="button" class="hcp-lg-i hcp-lg-st${this.stFilter === l ? " is-on" : ""}" data-st="${esc(l)}" aria-pressed="${this.stFilter === l}" style="--hcp-flag:${s.color || "var(--hcp-flag)"}"><span class="hcp-sw hcp-sw--ring"></span>${esc(l)}<b>${s.count.toLocaleString()}</b></button>`;
      }
      for (const [l, c] of lg || []) {
        h += `<button type="button" class="hcp-lg-i${this.lgFilter === l ? " is-on" : ""}" data-lg="${esc(l)}" aria-pressed="${this.lgFilter === l}"><span class="hcp-sw" style="${c ? "background:" + c : ""}"></span>${esc(l)}</button>`;
      }
      el.innerHTML = h;
      el.hidden = false;
    }
    _legendFilter(v) {
      this.lgFilter = v;
      this._legend();
      this._applyMarks();
    }
    // picks out one status: dims everyone else, or with "highlighted only" shows only them
    statusFilter(v) {
      this.stFilter = isBlank(v) ? null : String(v);
      this._legend();
      if (this.onlyHl) {
        this.update({ animate: true });
        this.fit();
      } else this._applyMarks();
    }
    _drawMini() {
      const show = !!this.o.miniMap && this.V.length > 1;
      this.mini.hidden = !show;
      if (!show) return this.miniMap = null;
      const dpr = window.devicePixelRatio || 1;
      const W = 180, H = 120;
      const cv = this.mini;
      if (cv.width !== W * dpr) {
        cv.width = W * dpr;
        cv.height = H * dpr;
      }
      const ctx = cv.getContext("2d");
      const b = this.bounds;
      const bw = b.x1 - b.x0, bh = b.y1 - b.y0;
      const s = Math.min((W - 12) / bw, (H - 12) / bh);
      const ox = (W - bw * s) / 2 - b.x0 * s, oy = (H - bh * s) / 2 - b.y0 * s;
      this.miniMap = { toWorld: (x, y) => ({ x: (x - ox) / s, y: (y - oy) / s }) };
      const css = getComputedStyle(this.el);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = css.getPropertyValue("--hcp-mini-node").trim() || "#94a3b8";
      for (const n of this.V) {
        const x = n.box.x * s + ox, y = n.box.y * s + oy;
        ctx.fillRect(x, y, Math.max(1.5, n.w * s), Math.max(1.5, n.h * s));
      }
      ctx.fillStyle = css.getPropertyValue("--hcp-hl").trim() || "#2563eb";
      for (const n of this.V) {
        if (!n.el || !n.el.classList.contains("hcp-flag")) continue;
        ctx.fillRect(n.box.x * s + ox, n.box.y * s + oy, Math.max(2, n.w * s), Math.max(2, n.h * s));
      }
      const t = this.t;
      ctx.strokeStyle = css.getPropertyValue("--hcp-primary").trim() || "#2563eb";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-t.x / t.k * s + ox, -t.y / t.k * s + oy, this.vw / t.k * s, this.vh / t.k * s);
    }
    /* ---------------- zoom / view ---------------- */
    _applyTransform() {
      const t = this.t;
      this.stage.style.transform = `translate(${t.x}px,${t.y}px) scale(${t.k})`;
      if (this.bandList) this._placeBands();
      if (!this.miniRaf) {
        this.miniRaf = requestAnimationFrame(() => {
          this.miniRaf = null;
          this._drawMini();
        });
      }
    }
    _setTransform(t, dur) {
      if (dur === void 0) dur = this._duration({}, 0) ? 450 : 0;
      if (dur) this.vpSel.transition().duration(dur).call(this.zoom.transform, t);
      else this.vpSel.call(this.zoom.transform, t);
    }
    zoomBy(f) {
      if (this._duration({}, 0)) this.vpSel.transition().duration(250).call(this.zoom.scaleBy, f);
      else this.vpSel.call(this.zoom.scaleBy, f);
    }
    fit(dur) {
      this._measureVp();
      const b = this.bounds;
      if (!b || !this.vw) return;
      const bw = b.x1 - b.x0, bh = b.y1 - b.y0;
      const pad = 24;
      const lg = this.legendEl.hidden ? 0 : this.legendEl.offsetHeight + 12;
      const top = pad + (this.eo === "BT" ? lg : 0), bottom = pad + (this.eo === "BT" ? 0 : lg);
      const h = this.vh - top - bottom;
      let k = Math.min((this.vw - pad * 2) / bw, h / bh, 1);
      k = Math.max(this.o.minZoom, k);
      const x = (this.vw - bw * k) / 2 - b.x0 * k;
      let y = top + (h - bh * k) / 2 - b.y0 * k;
      if (this.eo === "TB" && bh * k < h) y = top + 8 - b.y0 * k;
      this._setTransform(identity2.translate(x, y).scale(k), dur);
    }
    reset() {
      this.viewRoot = null;
      this.clearHighlight();
      this.clearPath();
      this.update({ animate: true });
      this._initialView(true);
    }
    _initialView(force) {
      const o = this.o;
      if (o.initialView === "HIGHLIGHT") {
        const f = this.order.find((n) => this._flag(n));
        if (f) return this.focusNode(f.id);
      }
      const dur = force ? void 0 : 0;
      const root2 = this.V.find((n) => n.vd === 0);
      if (o.initialView === "ROOT" && root2) return this.centerOn(root2, 1, dur, true);
      if (root2 && this.eo !== "RADIAL" && this._fitK() < 0.55) return this.centerOn(root2, 0.8, dur, true);
      this.fit(dur);
    }
    _fitK() {
      const b = this.bounds;
      if (!b || !this.vw) return 1;
      return Math.min((this.vw - 48) / (b.x1 - b.x0), (this.vh - 48) / (b.y1 - b.y0), 1);
    }
    // edge = true puts the node near the side the tree grows from (top for TB, left for LR, ...)
    centerOn(n, k, dur, edge) {
      if (!n || !n.box) return;
      this._measureVp();
      k = k || Math.max(this.t.k, 0.85);
      k = Math.min(Math.max(k, this.o.minZoom), this.o.maxZoom);
      const cx = n.box.x + n.w / 2, cy = n.box.y + n.h / 2;
      let x = this.vw / 2 - cx * k, y = this.vh / 2 - cy * k;
      if (edge) {
        const m = 40;
        if (this.eo === "TB") y = m - n.box.y * k;
        else if (this.eo === "BT") y = this.vh - m - (n.box.y + n.h) * k;
        else if (this.eo === "LR") x = m - n.box.x * k;
        else if (this.eo === "RL") x = this.vw - m - (n.box.x + n.w) * k;
        const b = this.bounds;
        if ((this.eo === "LR" || this.eo === "RL") && b) {
          const yt = 8 - b.y0 * k;
          if (y < yt && (n.box.y + n.h) * k + yt <= this.vh - 24) y = yt;
        }
      }
      this._setTransform(identity2.translate(x, y).scale(k), dur);
    }
    _ensureVisible(n) {
      if (!n.box) return;
      const t = this.t;
      const x = n.box.x * t.k + t.x, y = n.box.y * t.k + t.y;
      const w = n.w * t.k, h = n.h * t.k;
      const m = 24;
      if (x < m || y < m || x + w > this.vw - m || y + h > this.vh - m) this.centerOn(n, t.k, 300);
    }
    // hide far-away nodes on big charts (layout & links stay intact)
    _cull() {
      if (this.anim) return;
      const V = this.V;
      if (V.length < 300) {
        for (const n of V) if (n.culled) {
          n.el.style.display = "";
          n.culled = false;
        }
        return;
      }
      const t = this.t;
      const m = 300 / t.k;
      const x0 = -t.x / t.k - m, y0 = -t.y / t.k - m;
      const x1 = x0 + this.vw / t.k + 2 * m, y1 = y0 + this.vh / t.k + 2 * m;
      for (const n of V) {
        const b = n.box;
        const out = b.x > x1 || b.y > y1 || b.x + n.w < x0 || b.y + n.h < y0;
        if (out !== !!n.culled) {
          n.culled = out;
          n.el.style.display = out ? "none" : "";
        }
      }
    }
    /* ---------------- expand / collapse ---------------- */
    toggle(id2) {
      const n = this._get(id2);
      if (!n || !this.hasKids(n)) return Promise.resolve();
      return n.exp ? this.collapse(n.id) : this.expand(n.id);
    }
    expand(id2, opts) {
      const n = this._get(id2);
      if (!n || !this.hasKids(n)) return Promise.resolve();
      const go = () => {
        n.exp = true;
        this._save();
        if (!opts || opts.update !== false) this.update({ anchor: n });
        this._fire("expand", this._eventData(n));
      };
      if (this.lazy && !n.loaded) return this._loadChildren([n]).then(go);
      go();
      return Promise.resolve();
    }
    collapse(id2) {
      const n = this._get(id2);
      if (!n || !n.exp) return;
      n.exp = false;
      n.lim = this.o.maxChildren;
      this._save();
      this.update({ anchor: n });
      this._fire("collapse", this._eventData(n));
    }
    expandAll() {
      for (const n of this.nodes.values()) if (n.kids.length) n.exp = true;
      this._save();
      this.update({ animate: this.nodes.size < 600 });
      this.fit();
    }
    collapseAll() {
      for (const n of this.nodes.values()) {
        n.exp = false;
        n.lim = this.o.maxChildren;
      }
      const base = this.viewRoot ? [this.viewRoot] : this.roots;
      if (base.length === 1) base[0].exp = true;
      this._save();
      this.update({ animate: true });
      this.fit();
    }
    expandBranch(id2, open) {
      const n = this._get(id2);
      if (!n) return;
      const st = [n];
      while (st.length) {
        const c = st.pop();
        if (c.kids.length) c.exp = open;
        if (!open) c.lim = this.o.maxChildren;
        c.kids.forEach((k) => st.push(k));
      }
      if (open && this.lazy && !n.loaded) return this.expand(n.id);
      this._save();
      this.update({ anchor: n });
      this._fire(open ? "expand" : "collapse", this._eventData(n));
    }
    _showMore(p) {
      p.lim += this.o.maxChildren;
      const m = this.moreNodes.get(p.id);
      this.update({ anchor: m && m.cur ? m : p });
    }
    // Makes sure the node exists (lazy) and every ancestor is open; resolves to the node.
    expandTo(id2) {
      id2 = String(id2);
      const ready = this.nodes.has(id2) || !this.lazy ? Promise.resolve() : this._loadPath([id2]);
      return ready.then(() => {
        const n = this.nodes.get(id2);
        if (!n) return null;
        if (this.viewRoot && !this._isUnder(n, this.viewRoot)) this.viewRoot = null;
        const chain = [];
        for (let c = n.parent; c; c = c.parent) chain.unshift(c);
        const loads = chain.filter((c) => this.lazy && !c.loaded);
        const next = loads.length ? this._loadChildren(loads) : Promise.resolve();
        return next.then(() => {
          let child = n;
          for (let c = n.parent; c; c = c.parent) {
            c.exp = true;
            const i = c.kids.indexOf(child);
            if (i >= c.lim) c.lim = Math.ceil((i + 1) / this.o.maxChildren) * this.o.maxChildren;
            child = c;
          }
          this._save();
          return n;
        });
      });
    }
    _isUnder(n, a) {
      for (let c = n; c; c = c.parent) if (c === a) return true;
      return false;
    }
    /* ---------------- lazy loading ---------------- */
    _loadChildren(list) {
      list = list.filter((n) => !n.loaded && !n.loading);
      if (!list.length) return Promise.resolve();
      list.forEach((n) => {
        n.loading = true;
        this._syncNode(n);
      });
      return this._request({ x01: "CHILDREN", f01: list.map((n) => n.id) }).then((res) => {
        if (res && res.error) throw new Error(res.error);
        this._ingest(res, "merge");
        const pos = /* @__PURE__ */ new Map();
        (res.rows || []).forEach((r, i) => pos.set(String(r[this.ci.id]), i));
        list.forEach((n) => {
          n.loaded = true;
          n.loading = false;
          n.kids.sort((a, b) => (pos.has(a.id) ? pos.get(a.id) : 1e9) - (pos.has(b.id) ? pos.get(b.id) : 1e9) || a.seq - b.seq);
          n.cc = n.kids.length;
        });
        (res.rows || []).forEach((r) => {
          const c = this.nodes.get(String(r[this.ci.id]));
          if (c && !list.includes(c) && !c.kids.length) c.loaded = c.cc === 0;
        });
        this._derive();
      }).catch((err) => {
        list.forEach((n) => {
          n.loading = false;
          this._syncNode(n);
        });
        this._showToast(this.msg.ERROR);
        if (window.console) console.error("Hierarchy Pro:", err);
        throw err;
      });
    }
    _loadPath(ids) {
      return this._request({ x01: "PATH", f01: ids }).then((res) => {
        if (res && res.error) throw new Error(res.error);
        this._ingest(res, "merge");
        this._derive();
      });
    }
    _showToast(text) {
      this._showMsg(text, null);
      setTimeout(() => this.msgEl.hidden = true, 2500);
    }
    /* ---------------- click / navigation ---------------- */
    _click(n, ev) {
      const o = this.o;
      this.select(n.id, true);
      if (o.highlightPath === "CLICK") this.setPath(n.id);
      this._fire("node_click", this._eventData(n));
      const link = this._v(n, "link");
      let act = o.onClick;
      if (act === "AUTO") act = link ? "NAVIGATE" : this.hasKids(n) ? "TOGGLE" : "EVENT";
      if (act === "NAVIGATE" && link) this._navigate(String(link), n, ev);
      else if (act === "SET_ITEM" && o.clickItem) {
        if (window.apex && apex.item) apex.item(o.clickItem).setValue(n.id);
      } else if (act === "TOGGLE") this.toggle(n.id);
    }
    _navigate(url, n, ev) {
      const el = n.el;
      if (/^#action\$/.test(url) && window.apex && apex.navigation) {
        apex.navigation.redirect(url);
        return;
      }
      if (/^javascript:/i.test(url)) {
        let code = url.replace(/^javascript:/i, "");
        try {
          code = decodeURIComponent(code);
        } catch (e) {
        }
        try {
          new Function(code).call(el);
        } catch (e) {
          if (window.console) console.error("Hierarchy Pro: link failed", e);
        }
        return;
      }
      const target = this.linkAttrs.target || (ev && (ev.ctrlKey || ev.metaKey) ? "_blank" : null);
      if (target && target !== "_self") {
        window.open(url, target, "noopener");
      } else if (window.apex && apex.navigation) {
        apex.navigation.redirect(url);
      } else location.href = url;
    }
    select(id2) {
      const n = this._get(id2);
      const old = this.sel;
      this.sel = n && !n.more ? n : null;
      if (old && old.el) this._syncNode(old);
      if (this.sel && this.sel.el) this._syncNode(this.sel);
      if (old !== this.sel) this._fire("selection_change", this.sel ? this._eventData(this.sel) : { id: null });
    }
    getSelection() {
      return this.sel ? this.getNode(this.sel.id) : null;
    }
    _eventData(n) {
      return Object.assign({ id: n.id }, this.getNode(n.id) || {}, { element: n.el });
    }
    getNode(id2) {
      const n = this.nodes.get(String(id2));
      if (!n) return null;
      const data = {};
      if (n.r) this.cols.forEach((c, i) => data[c] = n.r[i]);
      return {
        id: n.id,
        parentId: n.parent ? n.parent.id : null,
        title: this._plain(n, "title") || n.vt || "",
        subtitle: this._plain(n, "subtitle"),
        level: (n.depth || 0) + 1,
        childCount: this.kidCount(n),
        descendantCount: n.desc || 0,
        expanded: !!n.exp,
        data
      };
    }
    getData() {
      return { columns: this.cols.slice(), rows: Array.from(this.nodes.values()).filter((n) => n.r).map((n) => n.r) };
    }
    /* ---------------- highlight ---------------- */
    setPath(id2) {
      const n = this._get(id2);
      if (!n || n.more) return this.clearPath();
      this.path = n;
      const set3 = /* @__PURE__ */ new Set();
      for (let c = n; c; c = c.parent) set3.add(c.id);
      if (this.o.pathSubtree) {
        const st = [n];
        while (st.length) {
          const c = st.pop();
          set3.add(c.id);
          c.kids.forEach((k) => st.push(k));
        }
      }
      this.pathSet = set3;
      this._applyMarks();
    }
    clearPath() {
      if (!this.path && !this.pathSet) return;
      this.path = null;
      this.pathSet = null;
      this._applyMarks();
    }
    // highlights several nodes (opening the path to each); fit = zoom to show them all
    highlight(ids, fit) {
      ids = this._ids(ids);
      this.hl = new Set(ids);
      return Promise.all(ids.map((i) => this.expandTo(i))).then(() => {
        this.update({ animate: true });
        this._applyMarks();
        if (fit) this.fitTo(ids);
      });
    }
    // zooms so the given nodes are all in view
    fitTo(ids) {
      const list = this._ids(ids).map((i) => this._get(i)).filter((n) => n && n.box && this.V.includes(n));
      if (!list.length) return;
      if (list.length === 1) return this.centerOn(list[0], Math.max(this.t.k, 0.9));
      this._measureVp();
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const n of list) {
        x0 = Math.min(x0, n.box.x);
        y0 = Math.min(y0, n.box.y);
        x1 = Math.max(x1, n.box.x + n.w);
        y1 = Math.max(y1, n.box.y + n.h);
      }
      const pad = 60;
      let k = Math.min((this.vw - pad * 2) / (x1 - x0), (this.vh - pad * 2) / (y1 - y0), 1);
      k = Math.max(this.o.minZoom, k);
      this._setTransform(identity2.translate(this.vw / 2 - (x0 + x1) / 2 * k, this.vh / 2 - (y0 + y1) / 2 * k).scale(k));
    }
    clearHighlight() {
      this.hl = /* @__PURE__ */ new Set();
      this._applyMarks();
    }
    focusNode(id2, opts) {
      return this.expandTo(id2).then((n) => {
        if (!n) return null;
        if (opts && opts.select) this.select(n.id, true);
        this.update({ animate: true });
        this.hl = /* @__PURE__ */ new Set([n.id]);
        this._applyMarks();
        this.centerOn(n, Math.max(this.t.k, 0.9));
        this._pulse(n);
        return n;
      });
    }
    _pulse(n) {
      if (!n.el) return;
      n.el.classList.remove("hcp-pulse");
      void n.el.offsetWidth;
      n.el.classList.add("hcp-pulse");
    }
    // apply highlight / match / path / legend classes to visible nodes and links
    _applyMarks() {
      const ps = this.pathSet;
      const lg = this.lgFilter;
      const sf = this.onlyHl ? null : this.stFilter;
      const li = this.ci.legend;
      const dim = !!ps || !!lg || !!sf;
      this.el.classList.toggle("hcp-dim", dim);
      const ms = new Set(this.matches.map((n) => n.id));
      const cur = this.matches[this.mi];
      for (const n of this.V) {
        const el = n.el;
        if (!el) continue;
        const f = sf && !ps && !lg ? this._flag(n) : null;
        const onP = ps ? ps.has(n.id) : lg ? li >= 0 && this._v(n, "legend") === lg : sf ? !!f && f.label === sf : false;
        el.classList.toggle("hcp-on", onP);
        el.classList.toggle("hcp-hl", this.hl.has(n.id));
        el.classList.toggle("hcp-match", ms.has(n.id));
        el.classList.toggle("hcp-cur", cur === n);
        const l = this.linkEls.get(n.id);
        if (l) {
          const on = ps ? ps.has(n.id) && n.vp && ps.has(n.vp.id) : false;
          l.classList.toggle("hcp-lk--on", on);
        }
      }
    }
    /* ---------------- search ---------------- */
    _text(n) {
      if (n.txt) return n.txt;
      const f = this._flag(n);
      const parts = [this._plain(n, "title"), this._plain(n, "subtitle"), this._plain(n, "badge"), f && f.label];
      if (n.r) for (const f2 of this.fields) parts.push(stripTags(n.r[f2.i]));
      return n.txt = norm(parts.join("  "));
    }
    search(term, keepPos) {
      const raw = String(term || "").trim();
      term = norm(raw);
      this.term = term;
      if (!term) {
        this.matches = [];
        this.mi = -1;
        this._searchUi();
        this._applyMarks();
        return Promise.resolve([]);
      }
      const done = (list2) => {
        if (this.term !== term) return list2;
        this.matches = list2;
        this.mi = list2.length ? keepPos ? Math.min(Math.max(this.mi, 0), list2.length - 1) : 0 : -1;
        this._searchUi();
        this._fire("search", { term, count: list2.length });
        if (list2.length) this._goMatch(keepPos);
        else this._applyMarks();
        return list2;
      };
      if (this.lazy) {
        return this._request({ x01: "SEARCH", x02: raw }).then((res) => {
          if (res && res.error) throw new Error(res.error);
          this._ingest(res, "merge");
          this._derive();
          const ids = (res.ids || []).map(String);
          return done(ids.map((i) => this.nodes.get(i)).filter(Boolean));
        });
      }
      const words = term.split(/\s+/);
      const list = this.order.filter((n) => {
        const t = this._text(n);
        return words.every((w) => t.includes(w));
      });
      return Promise.resolve(done(list));
    }
    _searchUi() {
      if (!this.qEl) return;
      const box = this.qEl.parentNode;
      const cnt = box.querySelector(".hcp-count");
      const prev = box.querySelector('[data-act="prev"]');
      const next = box.querySelector('[data-act="next"]');
      const has = this.matches.length > 0;
      cnt.textContent = this.term ? has ? fmt(this.msg.MATCHES, this.mi + 1, this.matches.length) : this.msg.NO_MATCH : "";
      box.classList.toggle("hcp-search--none", !!this.term && !has);
      prev.hidden = next.hidden = this.matches.length < 2;
    }
    _step(d) {
      if (!this.matches.length) return;
      this.mi = (this.mi + d + this.matches.length) % this.matches.length;
      this._searchUi();
      this._goMatch();
    }
    _goMatch(quiet) {
      const n = this.matches[this.mi];
      if (!n) return;
      this.expandTo(n.id).then(() => {
        this.update({ animate: true });
        this._applyMarks();
        if (!quiet) {
          this.centerOn(n, Math.max(this.t.k, 0.8));
          this._pulse(n);
        }
      });
    }
    /* ---------------- drill (show one branch) ---------------- */
    drillTo(id2) {
      const n = id2 === null || id2 === void 0 ? null : this.nodes.get(String(id2));
      this.viewRoot = n;
      if (n) n.exp = true;
      this._save();
      this.update({ animate: true });
      this.fit();
    }
    _crumbs() {
      const c = this.crumbs;
      if (!this.viewRoot) {
        c.hidden = true;
        c.textContent = "";
        return;
      }
      const chain = [];
      for (let x = this.viewRoot; x; x = x.parent) chain.unshift(x);
      let h = `<button type="button" class="hcp-crumb" data-act="crumb" data-id="">${icon("home")}<span>${esc(this.msg.ALL)}</span></button>`;
      chain.forEach((x, i) => {
        const last = i === chain.length - 1;
        h += `<span class="hcp-sep">${icon("chevron")}</span><button type="button" class="hcp-crumb" data-act="crumb" data-id="${esc(x.id)}"${last ? ' aria-current="true"' : ""}>${esc(this._plain(x, "title") || x.vt)}</button>`;
      });
      c.innerHTML = h;
      c.setAttribute("aria-label", this.msg.SHOW_BRANCH);
      c.hidden = false;
    }
    /* ---------------- style / orientation ---------------- */
    setOrientation(o) {
      o = String(o || "").toUpperCase();
      if (!ORIENTS.includes(o) || o === this.orient) return;
      this.orient = o;
      this._classes();
      this._save();
      this.update({ animate: true });
      this.fit();
    }
    setStyle(s) {
      s = String(s || "").toUpperCase();
      if (!this.views.includes(s)) return;
      this._finishAnim();
      this.style = s;
      this._classes();
      for (const n of this.V) {
        if (n.el) {
          const keep = n.cur;
          n.el.remove();
          n.el = null;
          n.keep = keep;
        }
      }
      this.update({ animate: true });
      for (const n of this.V) n.keep = null;
      this._save();
      this.fit();
    }
    setOption(name, value) {
      this.o[name] = value;
      if (name === "linkAttributes") {
        this.linkAttrs = parseLinkAttrs(value);
        return this.setStyle(this.style);
      }
      if (name === "accent" || name === "highlightColor") {
        this._classes();
        return this._drawMini();
      }
      if (name === "compact" || name === "shadow" || name === "rounded") {
        this._classes();
        return this.setStyle(this.style === "CUSTOM" ? "CUSTOM" : this.style, true);
      }
      if (["connector", "leafLayout", "siblingGap", "levelGap", "levelBands", "pathSubtree"].includes(name)) {
        if (this.V.length) this._bounds(this.V);
        return this.update({ animate: true });
      }
      if (["nodeWidth", "photos", "hiddenFields"].includes(name) || CONTENT[name]) return this.setStyle(this.style);
      if (name === "miniMap") return this._drawMini();
      if (name === "legend") return this._legend();
    }
    /* ---------------- user customization ---------------- */
    // applies one look setting; with User Customization on it is also saved for this user
    _pref(k, v) {
      if (k === "style") this.setStyle(v);
      else if (k === "orientation") this.setOrientation(v);
      else this.setOption(k, v);
      if (!this.custom) return;
      const same = Array.isArray(v) ? JSON.stringify(v) === JSON.stringify(this.base[k] || []) : v === this.base[k];
      if (same || v === null && isBlank(this.base[k])) delete this.prefs[k];
      else this.prefs[k] = v;
      this._savePrefs();
      this._cfgSync();
    }
    _savePrefs() {
      clearTimeout(this.prefsT);
      this.prefsT = setTimeout(() => {
        const p = Object.keys(this.prefs).length ? this.prefs : null;
        const done = () => this._cfgSaved();
        if (this.custom === "BROWSER") {
          localStore(this.prefsKey, p);
          done();
        } else {
          this._request({ x01: "PREFS", x02: p ? JSON.stringify(p) : "" }).then((res) => {
            if (res && res.error) throw new Error(res.error);
            done();
          }).catch((err) => {
            if (window.console) console.error("Hierarchy Pro: customization not saved", err);
          });
        }
        this._fire("customize", { prefs: Object.assign({}, this.prefs) });
      }, 400);
    }
    resetCustomization() {
      const keep = this.prefs;
      this.prefs = {};
      Object.keys(keep).forEach((k) => {
        const v = this.base[k];
        if (k === "style") this.setStyle(v || "AVATAR");
        else if (k === "orientation") this.setOrientation(v || "TB");
        else this.setOption(k, v);
      });
      if (this.custom) this._savePrefs();
      this._cfgSync();
    }
    getCustomization() {
      return Object.assign({}, this.prefs);
    }
    _cfgToggle() {
      if (this.cfgEl) return this._cfgClose();
      const m = this.msg;
      const seg = (k, list, label, ic) => `<div class="hcp-seg" role="radiogroup" aria-label="${esc(label)}" data-k="${k}">` + list.map((v) => `<button type="button" role="radio" data-v="${v}" title="${esc(ic ? ic(v).t : "")}" aria-label="${esc(ic ? ic(v).t : v)}">${ic ? ic(v).h : ""}</button>`).join("") + "</div>";
      const sw = (k, label) => `<div class="hcp-sws" role="radiogroup" aria-label="${esc(label)}" data-k="${k}">` + [null].concat(ACCENTS).map((c) => `<button type="button" role="radio" data-v="${c || ""}" class="${c ? "" : "hcp-sw--theme"}" style="${c ? "--c:" + c : ""}" title="${esc(c || m.C_THEME)}" aria-label="${esc(c || m.C_THEME)}"></button>`).join("") + "</div>";
      const tog = (k, label) => `<label class="hcp-tog"><input type="checkbox" data-k="${k}"><span class="hcp-tog-s" aria-hidden="true"></span><span>${esc(label)}</span></label>`;
      const rng = (k, label, min, max, step) => `<label class="hcp-rng"><span>${esc(label)}</span><output data-o="${k}"></output><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" aria-label="${esc(label)}"></label>`;
      const fields = (this.fields || []).map((f) => `<label class="hcp-tog hcp-fld"><input type="checkbox" data-f="${esc(f.c)}"><span class="hcp-tog-s" aria-hidden="true"></span><span>${esc(f.l)}</span></label>`).join("");
      const h = `<div class="hcp-cfg-hd"><b>${esc(m.CUSTOMIZE)}</b><button type="button" class="hcp-btn" data-c="close" title="${esc(m.CLOSE)}" aria-label="${esc(m.CLOSE)}">${icon("close")}</button></div><div class="hcp-cfg-bd"><h4>${esc(m.C_STYLE)}</h4><div class="hcp-stys" role="radiogroup" aria-label="${esc(m.C_STYLE)}" data-k="style">` + this.views.map((s) => `<button type="button" role="radio" data-v="${s}"><svg viewBox="0 0 40 28" aria-hidden="true" focusable="false">${STYLE_PREVIEW[s]}</svg><span>${esc(m["S_" + s])}</span></button>`).join("") + `</div><h4>${esc(m.C_CONTENT)}</h4><div class="hcp-togs">` + tog("showSubtitle", m.C_SUBTITLE) + tog("showBadge", m.C_BADGE) + tog("showStatus", m.C_STATUS) + (this.ci && this.ci.footer >= 0 ? tog("showFooter", m.C_FOOTER) : "") + tog("showTotals", m.C_TOTALS) + (fields ? tog("showBody", m.C_BODY) : "") + "</div>" + (fields ? `<div class="hcp-flds"><div class="hcp-togs">${fields}</div></div>` : "") + `<h4>${esc(m.C_LAYOUT)}</h4>` + seg("orientation", ORIENTS, m.C_LAYOUT, (v) => ({ t: m[v], h: icon("o_" + v.toLowerCase()) })) + `<h4>${esc(m.C_LOOK)}</h4><div class="hcp-togs">` + tog("compact", m.C_COMPACT) + tog("photos", m.C_PHOTOS) + `</div><details class="hcp-more"${this.cfgMore ? " open" : ""}><summary>${esc(m.C_MORE)}</summary><h4>${esc(m.C_CONNECTOR)}</h4>` + seg("connector", CONNECTORS, m.C_CONNECTOR, (v) => ({ t: m["CN_" + v], h: icon("c_" + v.toLowerCase()) })) + `<h4>${esc(m.C_LEAF)}</h4>` + seg("leafLayout", LEAFS, m.C_LEAF, (v) => ({ t: m["LF_" + v], h: `<span>${esc(m["LF_" + v])}</span>` })) + `<h4>${esc(m.C_SIZE)}</h4>` + rng("nodeWidth", m.C_WIDTH, 120, 360, 10) + rng("siblingGap", m.C_HGAP, 4, 80, 2) + rng("levelGap", m.C_VGAP, 20, 140, 4) + `<h4>${esc(m.C_ACCENT)}</h4>` + sw("accent", m.C_ACCENT) + `<h4>${esc(m.C_HLCOLOR)}</h4>` + sw("highlightColor", m.C_HLCOLOR) + `<h4>${esc(m.C_SHOW)}</h4><div class="hcp-togs">` + tog("rounded", m.C_ROUNDED) + tog("shadow", m.C_SHADOW) + tog("legend", m.C_LEGEND) + tog("miniMap", m.C_MINIMAP) + tog("levelBands", m.C_BANDS) + `</div></details></div><div class="hcp-cfg-ft"><span class="hcp-cfg-ok" aria-live="polite"></span><button type="button" class="hcp-cfg-reset" data-c="reset">${icon("reset")}<span>${esc(m.C_RESET)}</span></button></div>`;
      const p = document.createElement("div");
      p.className = "hcp-cfg";
      p.setAttribute("role", "dialog");
      p.setAttribute("aria-label", m.CUSTOMIZE);
      p.innerHTML = h;
      this.vp.appendChild(p);
      this.cfgEl = p;
      p.querySelector(".hcp-more").addEventListener("toggle", (ev) => this.cfgMore = ev.target.open);
      p.addEventListener("click", (ev) => {
        const c = ev.target.closest("[data-c]");
        if (c) return c.getAttribute("data-c") === "close" ? this._cfgClose(true) : this.resetCustomization();
        const b2 = ev.target.closest("[data-v]");
        const g = b2 && b2.closest("[data-k]");
        if (!g) return;
        const k = g.getAttribute("data-k");
        let v = b2.getAttribute("data-v");
        if (k === "accent" || k === "highlightColor") v = v || null;
        this._pref(k, v);
      });
      p.addEventListener("change", (ev) => {
        const i = ev.target;
        if (i.type !== "checkbox") return;
        if (i.hasAttribute("data-f")) {
          const off = Array.from(p.querySelectorAll("input[data-f]")).filter((x) => !x.checked).map((x) => x.getAttribute("data-f"));
          return this._pref("hiddenFields", off);
        }
        this._pref(i.getAttribute("data-k"), i.checked);
      });
      const slide = debounce((k, v) => this._pref(k, v), 160);
      p.addEventListener("input", (ev) => {
        const i = ev.target;
        if (i.type !== "range") return;
        const k = i.getAttribute("data-k");
        const out = p.querySelector(`[data-o="${k}"]`);
        if (out) out.textContent = i.value + "px";
        slide(k, +i.value);
      });
      this.cfgKey = (ev) => {
        if (ev.key === "Escape" && !document.querySelector(".hcp-menu")) this._cfgClose(p.contains(document.activeElement));
      };
      document.addEventListener("keydown", this.cfgKey);
      this._cfgSync();
      const b = this.el.querySelector('[data-act="customize"]');
      if (b) {
        b.setAttribute("aria-expanded", "true");
        b.classList.add("is-on");
      }
      const first = p.querySelector('[aria-checked="true"]') || p.querySelector("button");
      if (first) first.focus({ preventScroll: true });
    }
    _cfgClose(refocus) {
      if (!this.cfgEl) return;
      this.cfgEl.remove();
      this.cfgEl = null;
      document.removeEventListener("keydown", this.cfgKey);
      const b = this.el.querySelector('[data-act="customize"]');
      if (b) {
        b.setAttribute("aria-expanded", "false");
        b.classList.remove("is-on");
        if (refocus) b.focus({ preventScroll: true });
      }
    }
    // shows the current values in the open panel
    _cfgSync() {
      const p = this.cfgEl;
      if (!p) return;
      const o = this.o;
      const cur = { style: this.style, orientation: this.orient };
      const avail = (k) => CONTENT[k] && CONTENT[k] !== "totals" ? this._has(CONTENT[k]) : k === "photos" ? this._has("photo") : true;
      const dis = (el, off2) => {
        el.disabled = off2;
        const l = el.closest("label");
        if (l) {
          l.classList.toggle("is-off", off2);
          l.title = off2 ? this.msg.C_NOT_IN_VIEW : "";
        }
      };
      p.querySelectorAll("[data-k]").forEach((g) => {
        const k = g.getAttribute("data-k");
        const v = k in cur ? cur[k] : o[k];
        if (g.tagName === "INPUT" && g.type === "checkbox") {
          g.checked = v !== false && !!v;
          dis(g, !avail(k));
        } else if (g.tagName === "INPUT" && g.type === "range") {
          const val = k === "nodeWidth" ? this.nodeW : +v || 0;
          g.value = val;
          const out = p.querySelector(`[data-o="${k}"]`);
          if (out) out.textContent = val + "px";
        } else {
          g.querySelectorAll("[data-v]").forEach((b) => {
            const bv = b.getAttribute("data-v");
            const on = k === "accent" || k === "highlightColor" ? bv === (safeColor(v) || "") : bv === v;
            b.setAttribute("aria-checked", String(on));
          });
        }
      });
      const fl = p.querySelector(".hcp-flds");
      if (fl) fl.hidden = !this._has("body");
      const off = new Set(o.hiddenFields || []);
      p.querySelectorAll("input[data-f]").forEach((i) => {
        i.checked = !off.has(i.getAttribute("data-f"));
        dis(i, !this._show("body"));
      });
      const has = Object.keys(this.prefs).length > 0;
      const r = p.querySelector('[data-c="reset"]');
      if (r) r.disabled = !has;
    }
    _cfgSaved() {
      const s = this.cfgEl && this.cfgEl.querySelector(".hcp-cfg-ok");
      if (!s) return;
      s.textContent = this.msg.C_SAVED;
      s.classList.add("is-on");
      clearTimeout(this.savedT);
      this.savedT = setTimeout(() => s.classList.remove("is-on"), 1600);
    }
    /* ---------------- keyboard ---------------- */
    _setFocus(n, move) {
      if (!n || !n.el) return;
      this.focusId = n.id;
      for (const x of this.V) if (x.el) x.el.tabIndex = x === n ? 0 : -1;
      if (move) {
        if (n.culled) {
          n.el.style.display = "";
          n.culled = false;
        }
        n.el.focus({ preventScroll: true });
        this._ensureVisible(n);
      }
    }
    _key(ev) {
      const n = this._byEl(ev.target.closest(".hcp-node"));
      if (!n || ev.target !== n.el) return;
      const k = ev.key;
      const map = {
        TB: { ArrowDown: "child", ArrowUp: "parent", ArrowLeft: "prev", ArrowRight: "next" },
        RADIAL: { ArrowDown: "child", ArrowUp: "parent", ArrowLeft: "prev", ArrowRight: "next" },
        BT: { ArrowUp: "child", ArrowDown: "parent", ArrowLeft: "prev", ArrowRight: "next" },
        LR: { ArrowRight: "child", ArrowLeft: "parent", ArrowUp: "prev", ArrowDown: "next" },
        RL: { ArrowLeft: "child", ArrowRight: "parent", ArrowUp: "prev", ArrowDown: "next" }
      }[this.eo];
      let dir = map[k];
      if (this.rtl && (this.eo === "TB" || this.eo === "BT" || this.eo === "RADIAL") && (dir === "prev" || dir === "next")) {
        dir = dir === "prev" ? "next" : "prev";
      }
      let target = null;
      if (dir === "child") {
        if (this.hasKids(n) && !n.exp) {
          this.expand(n.id);
          ev.preventDefault();
          return;
        }
        target = n.shown[0];
      } else if (dir === "parent") target = n.vp;
      else if (dir === "prev" || dir === "next") {
        const sib = n.vp ? n.vp.shown : this.V.filter((x) => x.vd === 0);
        target = sib[sib.indexOf(n) + (dir === "prev" ? -1 : 1)];
      } else if (k === "Enter") {
        if (n.more) this._showMore(n.parent);
        else this._click(n, ev);
      } else if (k === " " || k === "Spacebar") {
        if (n.more) this._showMore(n.parent);
        else this.toggle(n.id);
      } else if (k === "Home") target = this.V[0];
      else if (k === "End") target = this.V[this.V.length - 1];
      else if (k === "ContextMenu" || k === "F10" && ev.shiftKey) {
        if (this.o.contextMenu && !n.more) {
          const r = n.el.getBoundingClientRect();
          this._nodeMenu(n, { x: r.left + r.width / 2, y: r.bottom });
        }
      } else if (k === "*") {
        this.expandBranch(n.id, true);
      } else return;
      ev.preventDefault();
      if (target) this._setFocus(target, true);
    }
    /* ---------------- menus ---------------- */
    _menu(anchor, items, point) {
      this._closeMenu();
      const m = document.createElement("div");
      m.className = "hcp-menu";
      m.setAttribute("role", "menu");
      m.innerHTML = items.map((it, i) => `<button type="button" role="${it.checked !== void 0 ? "menuitemradio" : "menuitem"}" data-i="${i}" tabindex="-1"` + (it.checked !== void 0 ? ` aria-checked="${!!it.checked}"` : "") + `><span class="hcp-mk">${it.checked ? icon("check") : ""}</span><span>${esc(it.label)}</span></button>`).join("");
      (this.isFs ? this.el : document.body).appendChild(m);
      if (this.rtl) m.dir = "rtl";
      const r = point ? { left: point.x, right: point.x, bottom: point.y, top: point.y } : anchor.getBoundingClientRect();
      const mw = m.offsetWidth, mh = m.offsetHeight;
      let x = this.rtl ? r.right - mw : r.left;
      let y = r.bottom + 4;
      x = Math.max(8, Math.min(x, window.innerWidth - mw - 8));
      if (y + mh > window.innerHeight - 8) y = Math.max(8, r.top - mh - 4);
      m.style.left = x + "px";
      m.style.top = y + "px";
      const btns = Array.from(m.querySelectorAll("button"));
      const close = (refocus) => {
        this._closeMenu();
        if (refocus && anchor && anchor.focus) anchor.focus({ preventScroll: true });
      };
      m.addEventListener("click", (ev) => {
        const b = ev.target.closest("button");
        if (!b) return;
        close(true);
        items[+b.getAttribute("data-i")].run();
      });
      m.addEventListener("keydown", (ev) => {
        const i = btns.indexOf(document.activeElement);
        if (ev.key === "ArrowDown") btns[(i + 1) % btns.length].focus();
        else if (ev.key === "ArrowUp") btns[(i - 1 + btns.length) % btns.length].focus();
        else if (ev.key === "Escape" || ev.key === "Tab") close(true);
        else return;
        ev.preventDefault();
      });
      const out = (ev) => {
        if (!m.contains(ev.target)) close(false);
      };
      setTimeout(() => document.addEventListener("pointerdown", out, true), 0);
      this.menuEl = m;
      this.menuOut = out;
      const ck = btns.find((b) => b.getAttribute("aria-checked") === "true") || btns[0];
      if (ck) ck.focus();
    }
    _closeMenu() {
      if (this.menuEl) {
        this.menuEl.remove();
        document.removeEventListener("pointerdown", this.menuOut, true);
        this.menuEl = null;
      }
    }
    _nodeMenu(n, pt) {
      const m = this.msg;
      const items = [];
      if (this._v(n, "link")) items.push({ label: m.OPEN, run: () => this._navigate(String(this._v(n, "link")), n) });
      items.push({ label: m.FOCUS, run: () => this.focusNode(n.id) });
      if (this.hasKids(n)) {
        items.push({ label: m.EXPAND_BRANCH, run: () => this.expandBranch(n.id, true) });
        items.push({ label: m.COLLAPSE_BRANCH, run: () => this.expandBranch(n.id, false) });
      }
      items.push({ label: m.HIGHLIGHT_PATH, run: () => this.setPath(n.id) });
      if (this.hasKids(n)) items.push({ label: m.SHOW_BRANCH, run: () => this.drillTo(n.id) });
      this._menu(n.el, items, pt);
    }
    /* ---------------- full screen ---------------- */
    toggleFullscreen() {
      const el = this.el;
      if (this.isFs) {
        if (document.fullscreenElement === el) document.exitFullscreen();
        else this._fsChanged(false);
      } else if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => this._fsChanged(true));
      } else this._fsChanged(true);
    }
    _fsChanged(on) {
      this.isFs = on;
      this.el.classList.toggle("hcp--fs", on);
      const b = this.el.querySelector('[data-act="fullscreen"]');
      if (b) {
        b.innerHTML = icon(on ? "exitFs" : "fullscreen");
        b.title = on ? this.msg.EXIT_FULLSCREEN : this.msg.FULLSCREEN;
        b.setAttribute("aria-label", b.title);
      }
      this._sizeViewport();
      setTimeout(() => {
        this._measureVp();
        this.fit();
      }, 60);
    }
    /* ---------------- export ---------------- */
    async _svgString() {
      this._finishAnim();
      for (const n of this.V) if (n.culled) n.el.style.display = "";
      const b = this.bounds;
      const pad = 24;
      const W = Math.ceil(b.x1 - b.x0 + pad * 2), H = Math.ceil(b.y1 - b.y0 + pad * 2);
      const vcss = getComputedStyle(this.vp);
      const bg = vcss.backgroundColor && vcss.backgroundColor !== "rgba(0, 0, 0, 0)" ? vcss.backgroundColor : "#ffffff";
      const font = getComputedStyle(this.el).fontFamily;
      const out = [];
      out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${r1(b.x0 - pad)} ${r1(b.y0 - pad)} ${W} ${H}" direction="${this.rtl ? "rtl" : "ltr"}">`);
      const fontCss = await this._fontFaces(font);
      if (fontCss) out.push(`<defs><style>${fontCss}</style></defs>`);
      out.push(`<rect x="${r1(b.x0 - pad)}" y="${r1(b.y0 - pad)}" width="${W}" height="${H}" fill="${bg}"/>`);
      const svgParts = [this.gBands, this.gPanels, this.gLinks];
      for (const g of svgParts) {
        for (const e of Array.from(g.children)) {
          const cs = getComputedStyle(e);
          const c = e.cloneNode(true);
          ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "font-size", "font-weight", "font-family"].forEach((p) => {
            const v = cs.getPropertyValue(p);
            if (v) c.setAttribute(p, v);
          });
          c.removeAttribute("class");
          out.push(new XMLSerializer().serializeToString(c));
        }
      }
      if (this.bandList) {
        const lc = getComputedStyle(this.el).getPropertyValue("--hcp-text") ? getComputedStyle(this.layer).color : "#555";
        for (const x of this.bandList) {
          const tx = this.L.horiz ? `x="${r1(x.at + x.size / 2)}" y="${r1(b.y0 + 18)}" text-anchor="middle"` : `x="${r1(this.rtl ? b.x1 - 10 : b.x0 + 10)}" y="${r1(x.at + 20)}" text-anchor="${this.rtl ? "end" : "start"}"`;
          out.push(`<text ${tx} fill="${lc}" opacity="0.7" font-size="11" font-weight="600" font-family="${esc(font)}">${esc(x.label)}</text>`);
        }
      }
      const ser = new XMLSerializer();
      const m = 18;
      for (const n of this.V) {
        if (!n.el) continue;
        const clone = await this._inlineClone(n.el);
        clone.style.transform = "none";
        clone.style.position = "absolute";
        clone.style.left = m + "px";
        clone.style.top = m + "px";
        const wrap = `<div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${n.w + 2 * m}px;height:${n.h + 2 * m}px;font-family:${esc(font)};direction:${this.rtl ? "rtl" : "ltr"}">`;
        out.push(`<foreignObject x="${r1(n.box.x - m)}" y="${r1(n.box.y - m)}" width="${n.w + 2 * m}" height="${n.h + 2 * m}">${wrap}${ser.serializeToString(clone)}</div></foreignObject>`);
      }
      out.push("</svg>");
      this._cull();
      return { svg: out.join(""), W, H };
    }
    async _fontFaces(family) {
      const first = String(family || "").split(",")[0].replace(/["']/g, "").trim().toLowerCase();
      if (!first) return "";
      let css = "";
      let total = 0;
      for (const sh of Array.from(document.styleSheets)) {
        let rules;
        try {
          rules = sh.cssRules;
        } catch (e) {
          continue;
        }
        for (const r of Array.from(rules || [])) {
          if (!(r instanceof CSSFontFaceRule)) continue;
          const fam = (r.style.getPropertyValue("font-family") || "").replace(/["']/g, "").trim().toLowerCase();
          if (fam !== first) continue;
          const src = r.style.getPropertyValue("src");
          const mm = /url\((["']?)([^"')]+)\1\)/.exec(src || "");
          if (!mm) continue;
          try {
            const url = new URL(mm[2], sh.href || location.href).href;
            const blob = await (await fetch(url)).blob();
            total += blob.size;
            if (total > 3e6) break;
            const data = await new Promise((res) => {
              const fr = new FileReader();
              fr.onload = () => res(fr.result);
              fr.readAsDataURL(blob);
            });
            css += `@font-face{font-family:"${r.style.getPropertyValue("font-family").replace(/["']/g, "")}";src:url(${data});font-weight:${r.style.getPropertyValue("font-weight") || "normal"};font-style:${r.style.getPropertyValue("font-style") || "normal"};}`;
          } catch (e) {
          }
        }
      }
      return css;
    }
    async _inlineClone(el) {
      const PROPS = [
        "display",
        "position",
        "top",
        "left",
        "right",
        "bottom",
        "width",
        "height",
        "min-width",
        "max-width",
        "min-height",
        "box-sizing",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "border-top-width",
        "border-right-width",
        "border-bottom-width",
        "border-left-width",
        "border-top-style",
        "border-right-style",
        "border-bottom-style",
        "border-left-style",
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-color",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-left-radius",
        "border-bottom-right-radius",
        "background-color",
        "background-image",
        "color",
        "font-family",
        "font-size",
        "font-weight",
        "font-style",
        "line-height",
        "letter-spacing",
        "text-align",
        "text-transform",
        "white-space",
        "overflow",
        "text-overflow",
        "opacity",
        "box-shadow",
        "flex",
        "flex-direction",
        "flex-wrap",
        "flex-shrink",
        "flex-grow",
        "align-items",
        "justify-content",
        "align-self",
        "gap",
        "row-gap",
        "column-gap",
        "grid-template-columns",
        "object-fit",
        "vertical-align",
        "direction",
        "z-index",
        "visibility",
        "transform",
        "-webkit-line-clamp",
        "-webkit-box-orient",
        "word-break",
        "overflow-wrap"
      ];
      const clone = el.cloneNode(true);
      const src = [el, ...el.querySelectorAll("*")];
      const dst = [clone, ...clone.querySelectorAll("*")];
      for (let i = 0; i < src.length; i++) {
        const cs = getComputedStyle(src[i]);
        let s = "";
        for (const p of PROPS) {
          const v = cs.getPropertyValue(p);
          if (v !== "") s += p + ":" + v + ";";
        }
        if (i === 0) s += "opacity:" + (this.el.classList.contains("hcp-dim") && !el.classList.contains("hcp-on") ? 0.28 : 1) + ";";
        if (src[i].classList.contains("hcp-card")) s += "transform:none;";
        dst[i].setAttribute("style", s);
        dst[i].removeAttribute("class");
        if (dst[i].tagName === "IMG") {
          const img = src[i];
          try {
            const c = document.createElement("canvas");
            c.width = img.naturalWidth || 64;
            c.height = img.naturalHeight || 64;
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            dst[i].setAttribute("src", c.toDataURL("image/png"));
            dst[i].removeAttribute("loading");
          } catch (e) {
            dst[i].remove();
          }
        }
      }
      return clone;
    }
    async exportImage(format, fileName) {
      format = String(format || "png").toLowerCase();
      const name = (fileName || this.o.fileName || "hierarchy") + "." + format;
      this._busy(true);
      try {
        const { svg, W, H } = await this._svgString();
        if (format === "svg") {
          this._download(new Blob([svg], { type: "image/svg+xml" }), name);
          return;
        }
        const img = new Image();
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        await img.decode();
        let scale = Math.min(2, 16e3 / W, 16e3 / H, Math.sqrt(12e7 / (W * H)));
        scale = Math.max(scale, 0.1);
        const c = document.createElement("canvas");
        c.width = Math.round(W * scale);
        c.height = Math.round(H * scale);
        const ctx = c.getContext("2d");
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, W, H);
        await new Promise((res) => c.toBlob((b) => {
          this._download(b, name);
          res();
        }, "image/png"));
      } catch (e) {
        if (window.console) console.error("Hierarchy Pro: export failed", e);
        this._showToast(this.msg.ERROR);
      } finally {
        this._busy(false);
      }
    }
    async print() {
      const { svg } = await this._svgString();
      const f = document.createElement("iframe");
      f.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
      document.body.appendChild(f);
      const d = f.contentDocument;
      d.open();
      d.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(this.o.fileName) + '</title><style>@page{size:auto;margin:10mm}html,body{margin:0}img{max-width:100%;max-height:100vh;display:block;margin:auto}</style></head><body><img alt=""></body></html>');
      d.close();
      const img = d.querySelector("img");
      img.onload = () => {
        f.contentWindow.focus();
        f.contentWindow.print();
        setTimeout(() => f.remove(), 1e3);
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }
    _download(blob, name) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 500);
    }
    /* ---------------- events out ---------------- */
    _fire(name, data, nativeName) {
      const ev = nativeName || EV + name;
      const a = window.apex;
      if (a && a.event && a.event.trigger) a.event.trigger(this.regionEl, ev, data);
      else this.regionEl.dispatchEvent(new CustomEvent(ev, { detail: data, bubbles: true }));
    }
    destroy() {
      this._closeMenu();
      this._cfgClose();
      if (this.ro) this.ro.disconnect();
      this.el.innerHTML = "";
      instances.delete(this.regionId);
    }
  };
  function pack(conts, gap) {
    const acc = conts[0].map((s) => s.slice());
    const offs = [0];
    for (let j = 1; j < conts.length; j++) {
      const c = conts[j];
      let off = -Infinity;
      const m = Math.min(acc.length, c.length);
      for (let k = 0; k < m; k++) {
        if (!acc[k] || !c[k]) continue;
        const need = acc[k][1] - c[k][0] + (k === 0 ? gap : gap * 1.5);
        if (need > off) off = need;
      }
      if (off === -Infinity) off = acc[0][1] - c[0][0] + gap;
      offs.push(off);
      for (let k = 0; k < c.length; k++) {
        if (!c[k]) continue;
        const s0 = c[k][0] + off, s1 = c[k][1] + off;
        if (acc[k]) {
          if (s0 < acc[k][0]) acc[k][0] = s0;
          if (s1 > acc[k][1]) acc[k][1] = s1;
        } else acc[k] = [s0, s1];
      }
    }
    return { offs, acc };
  }
  function elbow3(pa, pb, m, ca, cb, rad, P) {
    if (Math.abs(cb - pb) < 0.5) return "M" + P(pa, pb) + "L" + P(ca, cb);
    const sa = ca >= pa ? 1 : -1;
    const sb = cb > pb ? 1 : -1;
    const r = Math.max(0, Math.min(rad, Math.abs(cb - pb) / 2, Math.abs(m - pa), Math.abs(ca - m)));
    if (!r) return "M" + P(pa, pb) + "L" + P(m, pb) + "L" + P(m, cb) + "L" + P(ca, cb);
    return "M" + P(pa, pb) + "L" + P(m - sa * r, pb) + "Q" + P(m, pb) + " " + P(m, pb + sb * r) + "L" + P(m, cb - sb * r) + "Q" + P(m, cb) + " " + P(m + sa * r, cb) + "L" + P(ca, cb);
  }
  function elbow2(pa, pb, ia, e, rad, P) {
    const sa = ia >= pa ? 1 : -1;
    const sb = e >= pb ? 1 : -1;
    const r = Math.max(0, Math.min(rad, Math.abs(ia - pa), Math.abs(e - pb)));
    if (!r) return "M" + P(pa, pb) + "L" + P(ia, pb) + "L" + P(ia, e);
    return "M" + P(pa, pb) + "L" + P(ia - sa * r, pb) + "Q" + P(ia, pb) + " " + P(ia, pb + sb * r) + "L" + P(ia, e);
  }
  function init2(regionId, options, initFn) {
    let o = Object.assign({}, options || {});
    if (typeof initFn === "function") o = initFn(o) || o;
    const el = document.getElementById(regionId + "_hcp");
    if (!el) throw new Error("Hierarchy Pro: container " + regionId + "_hcp not found");
    if (instances.has(regionId)) instances.get(regionId).destroy();
    const c = new Chart(regionId, el, o);
    instances.set(regionId, c);
    const a = window.apex;
    if (a && a.region && a.region.create && document.getElementById(regionId)) {
      a.region.create(regionId, {
        type: "HierarchyChartPro",
        widget: () => a.jQuery ? a.jQuery(el) : el,
        refresh: () => c.refresh(),
        focus: () => {
          const f = c.layer.querySelector('.hcp-node[tabindex="0"]');
          if (f) f.focus();
        },
        expandAll: () => c.expandAll(),
        collapseAll: () => c.collapseAll(),
        expand: (id2) => c.expand(id2),
        collapse: (id2) => c.collapse(id2),
        toggle: (id2) => c.toggle(id2),
        expandTo: (id2) => c.expandTo(id2).then((n) => {
          c.update({ animate: true });
          return n ? c.getNode(n.id) : null;
        }),
        focusNode: (id2) => c.focusNode(id2),
        highlight: (ids, fit) => c.highlight(ids, fit),
        clearHighlight: () => {
          c.clearHighlight();
          c.clearPath();
        },
        fitTo: (ids) => c.fitTo(ids),
        showHighlightedOnly: (on) => c.showHighlightedOnly(on),
        statusFilter: (v) => c.statusFilter(v),
        getCustomization: () => c.getCustomization(),
        resetCustomization: () => c.resetCustomization(),
        customize: () => c._cfgToggle(),
        getViews: () => c.views.slice(),
        highlightPath: (id2) => c.setPath(id2),
        setOrientation: (v) => c.setOrientation(v),
        setStyle: (v) => c.setStyle(v),
        setOption: (k, v) => c.setOption(k, v),
        fit: () => c.fit(),
        zoomIn: () => c.zoomBy(1.3),
        zoomOut: () => c.zoomBy(1 / 1.3),
        search: (t) => c.search(t),
        drillTo: (id2) => c.drillTo(id2),
        exportImage: (f, n) => c.exportImage(f, n),
        print: () => c.print(),
        getNode: (id2) => c.getNode(id2),
        getSelection: () => c.getSelection(),
        select: (id2) => c.select(id2),
        getData: () => c.getData(),
        toggleFullscreen: () => c.toggleFullscreen()
      });
    }
    c.load(false);
    return c;
  }
  function get3(regionId) {
    return instances.get(regionId) || null;
  }
  var messages = MSG;
  var styles = STYLES.slice();
  var orientations = ORIENTS.slice();
  return __toCommonJS(hierarchyChartPro_exports);
})();
