var assert = require("assert");
var Class = require("../main");

describe("Class", function() {
  it("should have correct instanceof and override behavior", function() {
    var A = Class.extend({
      init: function(val) {
        this.val = val;
      }
    });

    var B = A.extend({
      init: function(val) {
        this._super(val + 1);
        this.overrideMe();
      },

      overrideMe: function() {
        // pass
      }
    });

    var C = B.extend({
      overrideMe: function() {
        this._super.apply(this, arguments);
        this.val += 1;
      },

      toString: function() {
        return "C(" + this.val + ")";
      }
    });

    var a = new A(3);
    var b = new B(3);
    var c = new C(3);

    assert.strictEqual(a.val, 3);
    assert.strictEqual(b.val, 4);
    assert.strictEqual(c.val, 5);

    assert.ok(a instanceof A);
    assert.ok(!(a instanceof B));
    assert.ok(!(a instanceof C));
    assert.ok(b instanceof A);
    assert.ok(b instanceof B);
    assert.ok(!(b instanceof C));
    assert.ok(c instanceof A);
    assert.ok(c instanceof B);
    assert.ok(c instanceof C);

    c.overrideMe();
    assert.strictEqual(c.val, 6);

    var Bp = B.prototype;
    var saved = Bp.overrideMe;

    Bp.overrideMe = function(x) { this.val += x };
    c.overrideMe(2);
    assert.strictEqual(c.val, 9);
    Bp.overrideMe = saved;
    c.overrideMe(2);
    assert.strictEqual(c.val, 10);
    assert.equal(c, "C(10)"); // note non-strict equality
  });
});

describe("statics", function() {
  it("should support static inheritance and constructors", function() {
    var A = Class.extend({
      name: "A",

      init: function(val) {
        this.val = val;
      },

      assertClass: function() {
        assert.notEqual(this, A);
        assert.strictEqual(this.cls, A);
      },

      statics: {
        init: function(cls) {
          cls.instance = cls.create(10);
        },

        create: function(val) {
          return new this(val + 1);
        },

        asdf: "asdf"
      }
    });

    var B = A.extend({
      name: "B",

      assertClass: function() {
        assert.notEqual(this, B);
        assert.strictEqual(this.cls, B);
      },

      conflict: function() {
        return "instance won";
      },

      toString: function() {
        return this.cls.toString();
      },

      statics: {
        toString: function() {
          return this.prototype.name;
        },

        conflict: function() {
          return "class won";
        }
      }
    });

    var C = B.extend({
      name: "C",

      assertClass: function() {
        assert.notEqual(this, C);
        assert.strictEqual(this.cls, C);
      },

      statics: {
        init: function(cls) {
          this._super(cls);
          cls.instance.val = 0;
        },

        create: function(val) {
          return this._super(val * 2);
        },

        toString: function() {
          return "<class " + this._super() + ">";
        },

        asdf: "ASDF"
      }
    });

    var a = A.create(2),
    b = B.create(3),
    c = C.create(4),
    c2 = new C(5);

    assert.ok(a instanceof A);
    assert.ok(!(a instanceof B));
    assert.ok(b instanceof A);
    assert.ok(b instanceof B);

    assert.strictEqual(a.val, 3);

    assert.strictEqual(b.val, 4);
    assert.strictEqual(B + "", b.name);
    assert.strictEqual(B + "", b + "");
    assert.strictEqual(B.toString(), b.toString());

    assert.strictEqual(c.val, 9);
    assert.strictEqual(c2.val, 5);
    assert.equal(c, "<class C>");
    assert.equal(C, "<class C>");

    assert.strictEqual(b.conflict(), "instance won");
    assert.strictEqual(B.conflict(), "class won");
    assert.strictEqual(c.conflict(), "instance won");
    assert.strictEqual(C.conflict(), "class won");

    a.assertClass();
    b.assertClass();
    c.assertClass();
    c2.assertClass();

    assert.strictEqual(A.asdf, "asdf");
    assert.strictEqual(B.asdf, "asdf");
    assert.strictEqual(C.asdf, "ASDF");

    assert.strictEqual(A.instance.cls, A);
    assert.strictEqual(B.instance.cls, B);
    assert.strictEqual(C.instance.cls, C);

    assert.strictEqual(A.instance.val, 11);
    assert.strictEqual(B.instance.val, 11);
    assert.strictEqual(C.instance.val, 0);
  });
});

describe("base property", function() {
  it("should equal the base class's prototype", function() {
    var A = Class.extend({
      foo: function() {
        return "name: " + this.name;
      }
    });

    var B = A.extend({
      name: "B",

      bar: function() {
        assert.strictEqual(B.base.bar, this._super);
        return B.base.foo.call(this);
      }
    });

    var C = B.extend({
      name: "C"
    });

    assert.strictEqual(B.base, A.prototype);
    assert.strictEqual(C.base, B.prototype);

    assert.strictEqual(new B().bar(), "name: B");
    assert.strictEqual(new C().bar(), "name: C");
  });
});
