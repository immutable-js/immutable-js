require("./core");
var types = require("../lib/types");
var def = types.Type.def;
var or = types.Type.or;
var builtin = types.builtInTypes;
var isBoolean = builtin.boolean;
var isObject = builtin.object;
var isString = builtin.string;
var defaults = require("../lib/shared").defaults;

def("Function")
    .field("generator", isBoolean, defaults["false"])
    .field("expression", isBoolean, defaults["false"])
    .field("defaults", [def("Expression")], defaults.emptyArray)
    // TODO This could be represented as a SpreadElementPattern in .params.
    .field("rest", or(def("Identifier"), null), defaults["null"]);

def("FunctionDeclaration")
    .build("id", "params", "body", "generator", "expression");

def("FunctionExpression")
    .build("id", "params", "body", "generator", "expression");

// TODO The Parser API calls this ArrowExpression, but Esprima uses
// ArrowFunctionExpression.
def("ArrowFunctionExpression")
    .bases("Function", "Expression")
    .build("params", "body", "expression")
    // The forced null value here is compatible with the overridden
    // definition of the "id" field in the Function interface.
    .field("id", null, defaults["null"])
    // The current spec forbids arrow generators, so I have taken the
    // liberty of enforcing that. TODO Report this.
    .field("generator", false);

def("YieldExpression")
    .bases("Expression")
    .build("argument", "delegate")
    .field("argument", or(def("Expression"), null))
    .field("delegate", isBoolean, defaults["false"]);

def("GeneratorExpression")
    .bases("Expression")
    .build("body", "blocks", "filter")
    .field("body", def("Expression"))
    .field("blocks", [def("ComprehensionBlock")])
    .field("filter", or(def("Expression"), null));

def("ComprehensionExpression")
    .bases("Expression")
    .build("body", "blocks", "filter")
    .field("body", def("Expression"))
    .field("blocks", [def("ComprehensionBlock")])
    .field("filter", or(def("Expression"), null));

def("ComprehensionBlock")
    .bases("Node")
    .build("left", "right", "each")
    .field("left", def("Pattern"))
    .field("right", def("Expression"))
    .field("each", isBoolean);

// This would be the ideal definition for ModuleSpecifier, but alas we
// can't expect ASTs parsed by Esprima to use this custom subtype:
def("ModuleSpecifier")
    .bases("Specifier", "Literal")
//  .build("value") // Make it abstract/non-buildable for now.
    .field("value", isString);

// Instead we must settle for a cheap type alias:
var ModuleSpecifier = def("Literal");

def("ModuleDeclaration")
    .bases("Declaration")
    .build("id", "from", "body")
    .field("id", or(def("Literal"), def("Identifier")))
    .field("source", or(ModuleSpecifier, null))
    .field("body", or(def("BlockStatement"), null));

def("Property")
    // Esprima extensions not mentioned in the Mozilla Parser API:
    .field("method", isBoolean, defaults["false"])
    .field("shorthand", isBoolean, defaults["false"])
    .field("computed", isBoolean, defaults["false"]);

def("MethodDefinition")
    .bases("Declaration")
    .build("kind", "key", "value")
    .field("kind", or("init", "get", "set", ""))
    .field("key", or(def("Literal"), def("Identifier")))
    .field("value", def("Function"));

def("SpreadElement")
    .bases("Node")
    .build("argument")
    .field("argument", def("Expression"));

def("ArrayExpression")
    .field("elements", [or(def("Expression"), def("SpreadElement"), null)]);

def("NewExpression")
    .field("arguments", [or(def("Expression"), def("SpreadElement"))]);

def("CallExpression")
    .field("arguments", [or(def("Expression"), def("SpreadElement"))]);

def("SpreadElementPattern")
    .bases("Pattern")
    .build("argument")
    .field("argument", def("Pattern"));

var ClassBodyElement = or(
    def("MethodDefinition"),
    def("VariableDeclarator"),
    def("ClassPropertyDefinition")
);

def("ClassPropertyDefinition") // static property
    .bases("Declaration")
    .build("definition")
    // Yes, Virginia, circular definitions are permitted.
    .field("definition", ClassBodyElement);

def("ClassBody")
    .bases("Declaration")
    .build("body")
    .field("body", [ClassBodyElement]);

def("ClassDeclaration")
    .bases("Declaration")
    .build("id", "body", "superClass")
    .field("id", def("Identifier"))
    .field("body", def("ClassBody"))
    .field("superClass", or(def("Expression"), null), defaults["null"]);

def("ClassExpression")
    .bases("Expression")
    .build("id", "body", "superClass")
    .field("id", or(def("Identifier"), null), defaults["null"])
    .field("body", def("ClassBody"))
    .field("superClass", or(def("Expression"), null), defaults["null"]);

// Specifier and NamedSpecifier are non-standard types that I introduced
// for definitional convenience.
def("Specifier").bases("Node");
def("NamedSpecifier")
    .bases("Specifier")
    .field("id", def("Identifier"))
    .field("name", or(def("Identifier"), null), defaults["null"]);

def("ExportSpecifier")
    .bases("NamedSpecifier")
    .build("id", "name");

def("ExportBatchSpecifier")
    .bases("Specifier")
    .build();

def("ImportSpecifier")
    .bases("NamedSpecifier")
    .build("id", "name");

def("ExportDeclaration")
    .bases("Declaration")
    .build("default", "declaration", "specifiers", "source")
    .field("default", isBoolean)
    .field("declaration", or(
        def("Declaration"),
        def("Expression") // Implies default.
    ))
    .field("specifiers", [or(
        def("ExportSpecifier"),
        def("ExportBatchSpecifier")
    )], defaults.emptyArray)
    .field("source", or(ModuleSpecifier, null), defaults["null"]);

def("ImportDeclaration")
    .bases("Declaration")
    .build("specifiers", "kind", "source")
    .field("specifiers", [def("ImportSpecifier")])
    .field("kind", or("named", "default"))
    .field("source", ModuleSpecifier);

def("TaggedTemplateExpression")
    .bases("Expression")
    .field("tag", def("Expression"))
    .field("quasi", def("TemplateLiteral"));

def("TemplateLiteral")
    .bases("Expression")
    .build("quasis", "expressions")
    .field("quasis", [def("TemplateElement")])
    .field("expressions", [def("Expression")]);

def("TemplateElement")
    .bases("Node")
    .build("value", "tail")
    .field("value", {"cooked": isString, "raw": isString})
    .field("tail", isBoolean);
