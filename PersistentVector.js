/**
 * @constructor
 */
cljs.core.PersistentVector = (function (meta, cnt, shift, root, tail, __hash) {
    this.meta = meta;
    this.cnt = cnt;
    this.shift = shift;
    this.root = root;
    this.tail = tail;
    this.__hash = __hash;
    this.cljs$lang$protocol_mask$partition1$ = 8196;
    this.cljs$lang$protocol_mask$partition0$ = 167668511;
})
cljs.core.PersistentVector.cljs$lang$type = true;
cljs.core.PersistentVector.cljs$lang$ctorStr = "cljs.core/PersistentVector";
cljs.core.PersistentVector.cljs$lang$ctorPrWriter = (function (this__3733__auto__, writer__3734__auto__, opt__3735__auto__) {
    return cljs.core._write.call(null, writer__3734__auto__, "cljs.core/PersistentVector");
});
cljs.core.PersistentVector.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    return (new cljs.core.TransientVector(self__.cnt, self__.shift, cljs.core.tv_editable_root.call(null, self__.root), cljs.core.tv_editable_tail.call(null, self__.tail)));
});
cljs.core.PersistentVector.prototype.cljs$core$IHash$_hash$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    var h__3577__auto__ = self__.__hash;
    if (!((h__3577__auto__ == null))) {
        return h__3577__auto__;
    } else {
        var h__3577__auto____$1 = cljs.core.hash_coll.call(null, coll__$1);
        self__.__hash = h__3577__auto____$1;
        return h__3577__auto____$1;
    }
});
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$2 = (function (coll, k) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core._lookup.call(null, coll__$1, k, null);
});
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$3 = (function (coll, k, not_found) {
    var self__ = this;
    var coll__$1 = this;
    if (typeof k === 'number') {
        return cljs.core._nth.call(null, coll__$1, k, not_found);
    } else {
        return not_found;
    }
});
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$_assoc$arity$3 = (function (coll, k, v) {
    var self__ = this;
    var coll__$1 = this;
    if (typeof k === 'number') {
        return cljs.core._assoc_n.call(null, coll__$1, k, v);
    } else {
        throw (new Error("Vector's key for assoc must be a number."));
    }
});



// Lee Note: interesting! By overriding call and apply they have implemented the Callable interface.
// myVector(4) returns the item at index 4. myVector(4, not_found) also seems to be an option.

cljs.core.PersistentVector.prototype.call = (function () {
    var G__5124 = null;
    var G__5124__2 = (function (self__, k) {
        var self__ = this;
        var self____$1 = this;
        var coll = self____$1;
        return coll.cljs$core$IIndexed$_nth$arity$2(null, k);
    });
    var G__5124__3 = (function (self__, k, not_found) {
        var self__ = this;
        var self____$1 = this;
        var coll = self____$1;
        return coll.cljs$core$IIndexed$_nth$arity$3(null, k, not_found);
    });
    G__5124 = function (self__, k, not_found) {
        switch (arguments.length) {
        case 2:
            return G__5124__2.call(this, self__, k);
        case 3:
            return G__5124__3.call(this, self__, k, not_found);
        }
        throw (new Error('Invalid arity: ' + arguments.length));
    };
    return G__5124;
})();
cljs.core.PersistentVector.prototype.apply = (function (self__, args5123) {
    var self__ = this;
    var self____$1 = this;
    return self____$1.call.apply(self____$1, [self____$1].concat(cljs.core.aclone.call(null, args5123)));
});
cljs.core.PersistentVector.prototype.cljs$core$IFn$_invoke$arity$1 = (function (k) {
    var self__ = this;
    var coll = this;
    return coll.cljs$core$IIndexed$_nth$arity$2(null, k);
});
cljs.core.PersistentVector.prototype.cljs$core$IFn$_invoke$arity$2 = (function (k, not_found) {
    var self__ = this;
    var coll = this;
    return coll.cljs$core$IIndexed$_nth$arity$3(null, k, not_found);
});
cljs.core.PersistentVector.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = (function (v, f, init) {
    var self__ = this;
    var v__$1 = this;
    var step_init = [0, init];
    var i = 0;
    while (true) {
        if ((i < self__.cnt)) {
            var arr = cljs.core.unchecked_array_for.call(null, v__$1, i);
            var len = arr.length;
            var init__$1 = (function () {
                var j = 0;
                var init__$1 = (step_init[1]);
                while (true) {
                    if ((j < len)) {
                        var init__$2 = f.call(null, init__$1, (j + i), (arr[j]));
                        if (cljs.core.reduced_QMARK_.call(null, init__$2)) {
                            return init__$2;
                        } else {
                            {
                                var G__5125 = (j + 1);
                                var G__5126 = init__$2;
                                j = G__5125;
                                init__$1 = G__5126;
                                continue;
                            }
                        }
                    } else {
                        (step_init[0] = len);
                        (step_init[1] = init__$1);
                        return init__$1;
                    }
                    break;
                }
            })();
            if (cljs.core.reduced_QMARK_.call(null, init__$1)) {
                return cljs.core.deref.call(null, init__$1);
            } else {
                {
                    var G__5127 = (i + (step_init[0]));
                    i = G__5127;
                    continue;
                }
            }
        } else {
            return (step_init[1]);
        }
        break;
    }
});




cljs.core.VectorNode = (function (edit, arr) {
    this.edit = edit;
    this.arr = arr;
})
cljs.core.VectorNode.cljs$lang$type = true;
cljs.core.VectorNode.cljs$lang$ctorStr = "cljs.core/VectorNode";
cljs.core.VectorNode.cljs$lang$ctorPrWriter = (function (this__3736__auto__, writer__3737__auto__, opts__3738__auto__) {
    return cljs.core._write.call(null, writer__3737__auto__, "cljs.core/VectorNode");
});
cljs.core.__GT_VectorNode = (function __GT_VectorNode(edit, arr) {
    return (new cljs.core.VectorNode(edit, arr));
});
cljs.core.pv_fresh_node = (function pv_fresh_node(edit) {
    return (new cljs.core.VectorNode(edit, [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]));
});
cljs.core.pv_aget = (function pv_aget(node, idx) {
    return (node.arr[idx]);
});
cljs.core.pv_aset = (function pv_aset(node, idx, val) {
    return (node.arr[idx] = val);
});
cljs.core.pv_clone_node = (function pv_clone_node(node) {
    return (new cljs.core.VectorNode(node.edit, cljs.core.aclone.call(null, node.arr)));
});
cljs.core.tail_off = (function tail_off(pv) {
    var cnt = pv.cnt;
    if ((cnt < 32)) {
        return 0;
    } else {
        return (((cnt - 1) >>> 5) << 5);
    }
});


/*
Usage: (conj coll x)
       (conj coll x & xs)
conj[oin]. Returns a new collection with the xs
'added'. (conj nil item) returns (item).  The 'addition' may
happen at different 'places' depending on the concrete type.
*/
cljs.core.PersistentVector.prototype.cljs$core$ICollection$_conj$arity$2 = (
    function (coll, o) {
        var self__ = this;
        var coll__$1 = this;
        if (((self__.cnt - cljs.core.tail_off.call(null, coll__$1)) < 32)) {
            var len = self__.tail.length;
            var new_tail = (new Array((len + 1)));
            var n__4014__auto___5128 = len;
            var i_5129 = 0;
            while (true) {
                if ((i_5129 < n__4014__auto___5128)) {
                    (new_tail[i_5129] = (self__.tail[i_5129])); {
                        var G__5130 = (i_5129 + 1);
                        i_5129 = G__5130;
                        continue;
                    }
                } else {}
                break;
            }
            (new_tail[len] = o);
            return (
                new cljs.core.PersistentVector(
                    self__.meta, (self__.cnt + 1),
                    self__.shift,
                    self__.root,
                    new_tail,
                    null
                )
            );
        } else {
            var root_overflow_QMARK_ = ((self__.cnt >>> 5) > (1 << self__.shift));
            var new_shift = ((root_overflow_QMARK_) ? (self__.shift + 5) : self__.shift);
            var new_root = (
                (root_overflow_QMARK_) ?
                (function () {
                    var n_r = cljs.core.pv_fresh_node.call(null, null);
                    cljs.core.pv_aset.call(null, n_r, 0, self__.root);
                    cljs.core.pv_aset.call(
                        null,
                        n_r,
                        1,
                        cljs.core.new_path.call(
                            null,
                            null,
                            self__.shift, (new cljs.core.VectorNode(null, self__.tail))
                        )
                    );
                    return n_r;
                })() :
                cljs.core.push_tail.call(
                    null,
                    coll__$1,
                    self__.shift,
                    self__.root, (new cljs.core.VectorNode(null, self__.tail))
                )
            );
            return (
                new cljs.core.PersistentVector(
                    self__.meta, (self__.cnt + 1),
                    new_shift,
                    new_root, [o],
                    null
                )
            );
        }
    }
);




cljs.core.PersistentVector.prototype.cljs$core$IReversible$_rseq$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    if ((self__.cnt > 0)) {
        return (new cljs.core.RSeq(coll__$1, (self__.cnt - 1), null));
    } else {
        return null;
    }
});
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_key$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core._nth.call(null, coll__$1, 0);
});
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_val$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core._nth.call(null, coll__$1, 1);
});
cljs.core.PersistentVector.prototype.toString = (function () {
    var self__ = this;
    var coll = this;
    return cljs.core.pr_str_STAR_.call(null, coll);
});
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$2 = (function (v, f) {
    var self__ = this;
    var v__$1 = this;
    return cljs.core.ci_reduce.call(null, v__$1, f);
});
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$3 = (function (v, f, start) {
    var self__ = this;
    var v__$1 = this;
    return cljs.core.ci_reduce.call(null, v__$1, f, start);
});
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$_seq$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    if ((self__.cnt === 0)) {
        return null;
    } else {
        if ((self__.cnt <= 32)) {
            return (new cljs.core.IndexedSeq(self__.tail, 0));
        } else {
            if (new cljs.core.Keyword(null, "else", "else", 1017020587)) {
                return cljs.core.chunked_seq.call(null, coll__$1, cljs.core.first_array_for_longvec.call(null, coll__$1), 0, 0);
            } else {
                return null;
            }
        }
    }
});
cljs.core.PersistentVector.prototype.cljs$core$ICounted$_count$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    return self__.cnt;
});
cljs.core.PersistentVector.prototype.cljs$core$IStack$_peek$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    if ((self__.cnt > 0)) {
        return cljs.core._nth.call(null, coll__$1, (self__.cnt - 1));
    } else {
        return null;
    }
});
cljs.core.PersistentVector.prototype.cljs$core$IStack$_pop$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    if ((self__.cnt === 0)) {
        throw (new Error("Can't pop empty vector"));
    } else {
        if ((1 === self__.cnt)) {
            return cljs.core._with_meta.call(null, cljs.core.PersistentVector.EMPTY, self__.meta);
        } else {
            if ((1 < (self__.cnt - cljs.core.tail_off.call(null, coll__$1)))) {
                return (new cljs.core.PersistentVector(self__.meta, (self__.cnt - 1), self__.shift, self__.root, self__.tail.slice(0, -1), null));
            } else {
                if (new cljs.core.Keyword(null, "else", "else", 1017020587)) {
                    var new_tail = cljs.core.unchecked_array_for.call(null, coll__$1, (self__.cnt - 2));
                    var nr = cljs.core.pop_tail.call(null, coll__$1, self__.shift, self__.root);
                    var new_root = (((nr == null)) ? cljs.core.PersistentVector.EMPTY_NODE : nr);
                    var cnt_1 = (self__.cnt - 1);
                    if (((5 < self__.shift)) && ((cljs.core.pv_aget.call(null, new_root, 1) == null))) {
                        return (new cljs.core.PersistentVector(self__.meta, cnt_1, (self__.shift - 5), cljs.core.pv_aget.call(null, new_root, 0), new_tail, null));
                    } else {
                        return (new cljs.core.PersistentVector(self__.meta, cnt_1, self__.shift, new_root, new_tail, null));
                    }
                } else {
                    return null;
                }
            }
        }
    }
});
cljs.core.PersistentVector.prototype.cljs$core$IVector$_assoc_n$arity$3 = (
    function (coll, n, val) {
        var self__ = this;
        var coll__$1 = this;
        if (((0 <= n)) && ((n < self__.cnt))) {
            if ((cljs.core.tail_off.call(null, coll__$1) <= n)) {
                var new_tail = cljs.core.aclone.call(null, self__.tail);
                (new_tail[(n & 31)] = val);
                return (new cljs.core.PersistentVector(self__.meta, self__.cnt, self__.shift, self__.root, new_tail, null));
            } else {
                return (new cljs.core.PersistentVector(self__.meta, self__.cnt, self__.shift, cljs.core.do_assoc.call(null, coll__$1, self__.shift, self__.root, n, val), self__.tail, null));
            }
        } else {
            if ((n === self__.cnt)) {
                return cljs.core._conj.call(null, coll__$1, val);
            } else {
                if (new cljs.core.Keyword(null, "else", "else", 1017020587)) {
                    throw (new Error([cljs.core.str("Index "), cljs.core.str(n), cljs.core.str(" out of bounds  [0,"), cljs.core.str(self__.cnt), cljs.core.str("]")].join('')));
                } else {
                    return null;
                }
            }
        }
    }
);
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$_equiv$arity$2 = (function (coll, other) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core.equiv_sequential.call(null, coll__$1, other);
});
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = (function (coll, meta__$1) {
    var self__ = this;
    var coll__$1 = this;
    return (new cljs.core.PersistentVector(meta__$1, self__.cnt, self__.shift, self__.root, self__.tail, self__.__hash));
});
cljs.core.PersistentVector.prototype.cljs$core$ICloneable$_clone$arity$1 = (function (_) {
    var self__ = this;
    var ___$1 = this;
    return (new cljs.core.PersistentVector(self__.meta, self__.cnt, self__.shift, self__.root, self__.tail, self__.__hash));
});
cljs.core.PersistentVector.prototype.cljs$core$IMeta$_meta$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    return self__.meta;
});
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$2 = (function (coll, n) {
    var self__ = this;
    var coll__$1 = this;
    return (cljs.core.array_for.call(null, coll__$1, n)[(n & 31)]);
});
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$3 = (function (coll, n, not_found) {
    var self__ = this;
    var coll__$1 = this;
    if (((0 <= n)) && ((n < self__.cnt))) {
        return (cljs.core.unchecked_array_for.call(null, coll__$1, n)[(n & 31)]);
    } else {
        return not_found;
    }
});
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, self__.meta);
});
cljs.core.__GT_PersistentVector = (function __GT_PersistentVector(meta, cnt, shift, root, tail, __hash) {
    return (new cljs.core.PersistentVector(meta, cnt, shift, root, tail, __hash));
});
cljs.core.PersistentVector.EMPTY_NODE = (new cljs.core.VectorNode(null, [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]));
cljs.core.PersistentVector.EMPTY = (new cljs.core.PersistentVector(null, 0, 5, cljs.core.PersistentVector.EMPTY_NODE, [], 0));
cljs.core.PersistentVector.fromArray = (function (xs, no_clone) {
    var l = xs.length;
    var xs__$1 = ((no_clone) ? xs : cljs.core.aclone.call(null, xs));
    if ((l < 32)) {
        return (new cljs.core.PersistentVector(null, l, 5, cljs.core.PersistentVector.EMPTY_NODE, xs__$1, null));
    } else {
        var node = xs__$1.slice(0, 32);
        var v = (new cljs.core.PersistentVector(null, 32, 5, cljs.core.PersistentVector.EMPTY_NODE, node, null));
        var i = 32;
        var out = cljs.core._as_transient.call(null, v);
        while (true) {
            if ((i < l)) {
                {
                    var G__5131 = (i + 1);
                    var G__5132 = cljs.core.conj_BANG_.call(null, out, (xs__$1[i]));
                    i = G__5131;
                    out = G__5132;
                    continue;
                }
            } else {
                return cljs.core.persistent_BANG_.call(null, out);
            }
            break;
        }
    }
});
cljs.core.vec = (function vec(coll) {
    return cljs.core._persistent_BANG_.call(null, cljs.core.reduce.call(null, cljs.core._conj_BANG_, cljs.core._as_transient.call(null, cljs.core.PersistentVector.EMPTY), coll));
});
/**
 * @param {...*} var_args
 */
cljs.core.vector = (function () {
    var vector__delegate = function (args) {
        if (((args instanceof cljs.core.IndexedSeq)) && ((args.i === 0))) {
            return cljs.core.PersistentVector.fromArray.call(null, args.arr, true);
        } else {
            return cljs.core.vec.call(null, args);
        }
    };
    var vector = function (var_args) {
        var args = null;
        if (arguments.length > 0) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0);
        }
        return vector__delegate.call(this, args);
    };
    vector.cljs$lang$maxFixedArity = 0;
    vector.cljs$lang$applyTo = (function (arglist__5133) {
        var args = cljs.core.seq(arglist__5133);
        return vector__delegate(args);
    });
    vector.cljs$core$IFn$_invoke$arity$variadic = vector__delegate;
    return vector;
})();




cljs.core._nth = (function () {
    var _nth = null;
    var _nth__2 = (function (coll, n) {
        if ((function () {
            var and__3154__auto__ = coll;
            if (and__3154__auto__) {
                return coll.cljs$core$IIndexed$_nth$arity$2;
            } else {
                return and__3154__auto__;
            }
        })()) {
            return coll.cljs$core$IIndexed$_nth$arity$2(coll, n);
        } else {
            var x__3793__auto__ = (((coll == null)) ? null : coll);
            return (function () {
                var or__3166__auto__ = (cljs.core._nth[goog.typeOf(x__3793__auto__)]);
                if (or__3166__auto__) {
                    return or__3166__auto__;
                } else {
                    var or__3166__auto____$1 = (cljs.core._nth["_"]);
                    if (or__3166__auto____$1) {
                        return or__3166__auto____$1;
                    } else {
                        throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
                    }
                }
            })().call(null, coll, n);
        }
    });
    var _nth__3 = (function (coll, n, not_found) {
        if ((function () {
            var and__3154__auto__ = coll;
            if (and__3154__auto__) {
                return coll.cljs$core$IIndexed$_nth$arity$3;
            } else {
                return and__3154__auto__;
            }
        })()) {
            return coll.cljs$core$IIndexed$_nth$arity$3(coll, n, not_found);
        } else {
            var x__3793__auto__ = (((coll == null)) ? null : coll);
            return (function () {
                var or__3166__auto__ = (cljs.core._nth[goog.typeOf(x__3793__auto__)]);
                if (or__3166__auto__) {
                    return or__3166__auto__;
                } else {
                    var or__3166__auto____$1 = (cljs.core._nth["_"]);
                    if (or__3166__auto____$1) {
                        return or__3166__auto____$1;
                    } else {
                        throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
                    }
                }
            })().call(null, coll, n, not_found);
        }
    });
    _nth = function (coll, n, not_found) {
        switch (arguments.length) {
        case 2:
            return _nth__2.call(this, coll, n);
        case 3:
            return _nth__3.call(this, coll, n, not_found);
        }
        throw (new Error('Invalid arity: ' + arguments.length));
    };
    _nth.cljs$core$IFn$_invoke$arity$2 = _nth__2;
    _nth.cljs$core$IFn$_invoke$arity$3 = _nth__3;
    return _nth;
})();



/**
 * Returns a persistent vector of the items in vector from
 * start (inclusive) to end (exclusive).  If end is not supplied,
 * defaults to (count vector). This operation is O(1) and very fast, as
 * the resulting vector shares structure with the original and no
 * trimming is done.
 */
cljs.core.subvec = (function () {
    var subvec = null;
    var subvec__2 = (function (v, start) {
        return subvec.call(null, v, start, cljs.core.count.call(null, v));
    });
    var subvec__3 = (function (v, start, end) {
        return cljs.core.build_subvec.call(null, null, v, start, end, null);
    });
    subvec = function (v, start, end) {
        switch (arguments.length) {
        case 2:
            return subvec__2.call(this, v, start);
        case 3:
            return subvec__3.call(this, v, start, end);
        }
        throw (new Error('Invalid arity: ' + arguments.length));
    };
    subvec.cljs$core$IFn$_invoke$arity$2 = subvec__2;
    subvec.cljs$core$IFn$_invoke$arity$3 = subvec__3;
    return subvec;
})();



/**
 * @param {...*} var_args
 */
cljs.core.vector = (function () {
    var vector__delegate = function (args) {
        if (((args instanceof cljs.core.IndexedSeq)) && ((args.i === 0))) {
            return cljs.core.PersistentVector.fromArray.call(null, args.arr, true);
        } else {
            return cljs.core.vec.call(null, args);
        }
    };
    var vector = function (var_args) {
        var args = null;
        if (arguments.length > 0) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0);
        }
        return vector__delegate.call(this, args);
    };
    vector.cljs$lang$maxFixedArity = 0;
    vector.cljs$lang$applyTo = (function (arglist__5133) {
        var args = cljs.core.seq(arglist__5133);
        return vector__delegate(args);
    });
    vector.cljs$core$IFn$_invoke$arity$variadic = vector__delegate;
    return vector;
})();



/**
 * Returns a lazy seq representing the concatenation of the elements in the supplied colls.
 * @param {...*} var_args
 */
cljs.core.concat = (function () {
    var concat = null;
    var concat__0 = (function () {
        return (new cljs.core.LazySeq(null, (function () {
            return null;
        }), null, null));
    });
    var concat__1 = (function (x) {
        return (new cljs.core.LazySeq(null, (function () {
            return x;
        }), null, null));
    });
    var concat__2 = (function (x, y) {
        return (new cljs.core.LazySeq(null, (function () {
            var s = cljs.core.seq.call(null, x);
            if (s) {
                if (cljs.core.chunked_seq_QMARK_.call(null, s)) {
                    return cljs.core.chunk_cons.call(null, cljs.core.chunk_first.call(null, s), concat.call(null, cljs.core.chunk_rest.call(null, s), y));
                } else {
                    return cljs.core.cons.call(null, cljs.core.first.call(null, s), concat.call(null, cljs.core.rest.call(null, s), y));
                }
            } else {
                return y;
            }
        }), null, null));
    });
    var concat__3 = (function () {
        var G__4954__delegate = function (x, y, zs) {
            var cat = (function cat(xys, zs__$1) {
                return (new cljs.core.LazySeq(null, (function () {
                    var xys__$1 = cljs.core.seq.call(null, xys);
                    if (xys__$1) {
                        if (cljs.core.chunked_seq_QMARK_.call(null, xys__$1)) {
                            return cljs.core.chunk_cons.call(null, cljs.core.chunk_first.call(null, xys__$1), cat.call(null, cljs.core.chunk_rest.call(null, xys__$1), zs__$1));
                        } else {
                            return cljs.core.cons.call(null, cljs.core.first.call(null, xys__$1), cat.call(null, cljs.core.rest.call(null, xys__$1), zs__$1));
                        }
                    } else {
                        if (cljs.core.truth_(zs__$1)) {
                            return cat.call(null, cljs.core.first.call(null, zs__$1), cljs.core.next.call(null, zs__$1));
                        } else {
                            return null;
                        }
                    }
                }), null, null));
            });
            return cat.call(null, concat.call(null, x, y), zs);
        };
        var G__4954 = function (x, y, var_args) {
            var zs = null;
            if (arguments.length > 2) {
                zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0);
            }
            return G__4954__delegate.call(this, x, y, zs);
        };
        G__4954.cljs$lang$maxFixedArity = 2;
        G__4954.cljs$lang$applyTo = (function (arglist__4955) {
            var x = cljs.core.first(arglist__4955);
            arglist__4955 = cljs.core.next(arglist__4955);
            var y = cljs.core.first(arglist__4955);
            var zs = cljs.core.rest(arglist__4955);
            return G__4954__delegate(x, y, zs);
        });
        G__4954.cljs$core$IFn$_invoke$arity$variadic = G__4954__delegate;
        return G__4954;
    })();
    concat = function (x, y, var_args) {
        var zs = var_args;
        switch (arguments.length) {
        case 0:
            return concat__0.call(this);
        case 1:
            return concat__1.call(this, x);
        case 2:
            return concat__2.call(this, x, y);
        default:
            return concat__3.cljs$core$IFn$_invoke$arity$variadic(x, y, cljs.core.array_seq(arguments, 2));
        }
        throw (new Error('Invalid arity: ' + arguments.length));
    };
    concat.cljs$lang$maxFixedArity = 2;
    concat.cljs$lang$applyTo = concat__3.cljs$lang$applyTo;
    concat.cljs$core$IFn$_invoke$arity$0 = concat__0;
    concat.cljs$core$IFn$_invoke$arity$1 = concat__1;
    concat.cljs$core$IFn$_invoke$arity$2 = concat__2;
    concat.cljs$core$IFn$_invoke$arity$variadic = concat__3.cljs$core$IFn$_invoke$arity$variadic;
    return concat;
})();




/**
 * @constructor
 */
cljs.core.LazySeq = (function (meta, fn, s, __hash) {
    this.meta = meta;
    this.fn = fn;
    this.s = s;
    this.__hash = __hash;
    this.cljs$lang$protocol_mask$partition1$ = 0;
    this.cljs$lang$protocol_mask$partition0$ = 32374988;
})
cljs.core.LazySeq.cljs$lang$type = true;
cljs.core.LazySeq.cljs$lang$ctorStr = "cljs.core/LazySeq";
cljs.core.LazySeq.cljs$lang$ctorPrWriter = (function (this__3733__auto__, writer__3734__auto__, opt__3735__auto__) {
    return cljs.core._write.call(null, writer__3734__auto__, "cljs.core/LazySeq");
});
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    var h__3577__auto__ = self__.__hash;
    if (!((h__3577__auto__ == null))) {
        return h__3577__auto__;
    } else {
        var h__3577__auto____$1 = cljs.core.hash_coll.call(null, coll__$1);
        self__.__hash = h__3577__auto____$1;
        return h__3577__auto____$1;
    }
});
cljs.core.LazySeq.prototype.cljs$core$INext$_next$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    cljs.core._seq.call(null, coll__$1);
    if ((self__.s == null)) {
        return null;
    } else {
        return cljs.core.next.call(null, self__.s);
    }
});
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj$arity$2 = (function (coll, o) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core.cons.call(null, o, coll__$1);
});
cljs.core.LazySeq.prototype.toString = (function () {
    var self__ = this;
    var coll = this;
    return cljs.core.pr_str_STAR_.call(null, coll);
});
cljs.core.LazySeq.prototype.sval = (function () {
    var self__ = this;
    var coll = this;
    if ((self__.fn == null)) {
        return self__.s;
    } else {
        self__.s = self__.fn.call(null);
        self__.fn = null;
        return self__.s;
    }
});
cljs.core.LazySeq.prototype.cljs$core$IReduce$_reduce$arity$2 = (function (coll, f) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core.seq_reduce.call(null, f, coll__$1);
});
cljs.core.LazySeq.prototype.cljs$core$IReduce$_reduce$arity$3 = (function (coll, f, start) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core.seq_reduce.call(null, f, start, coll__$1);
});
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    coll__$1.sval();
    if ((self__.s == null)) {
        return null;
    } else {
        var ls = self__.s;
        while (true) {
            if ((ls instanceof cljs.core.LazySeq)) {
                {
                    var G__4923 = ls.sval();
                    ls = G__4923;
                    continue;
                }
            } else {
                self__.s = ls;
                return cljs.core.seq.call(null, self__.s);
            }
            break;
        }
    }
});
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    cljs.core._seq.call(null, coll__$1);
    if ((self__.s == null)) {
        return null;
    } else {
        return cljs.core.first.call(null, self__.s);
    }
});
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    cljs.core._seq.call(null, coll__$1);
    if (!((self__.s == null))) {
        return cljs.core.rest.call(null, self__.s);
    } else {
        return cljs.core.List.EMPTY;
    }
});
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = (function (coll, other) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core.equiv_sequential.call(null, coll__$1, other);
});
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = (function (coll, meta__$1) {
    var self__ = this;
    var coll__$1 = this;
    return (new cljs.core.LazySeq(meta__$1, self__.fn, self__.s, self__.__hash));
});
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    return self__.meta;
});
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = (function (coll) {
    var self__ = this;
    var coll__$1 = this;
    return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, self__.meta);
});
cljs.core.__GT_LazySeq = (function __GT_LazySeq(meta, fn, s, __hash) {
    return (new cljs.core.LazySeq(meta, fn, s, __hash));
});
