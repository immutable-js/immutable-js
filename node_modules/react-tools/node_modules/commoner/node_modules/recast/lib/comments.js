var assert = require("assert");
var linesModule = require("./lines");
var fromString = linesModule.fromString;
var Lines = linesModule.Lines;
var concat = linesModule.concat;
var Visitor = require("./visitor").Visitor;
var comparePos = require("./util").comparePos;

exports.add = function(ast, lines) {
    var comments = ast.comments;
    assert.ok(comments instanceof Array);
    delete ast.comments;

    assert.ok(lines instanceof Lines);

    var pt = new PosTracker,
        len = comments.length,
        comment,
        key,
        loc, locs = pt.locs,
        pair,
        sorted = [];

    pt.visit(ast);

    for (var i = 0; i < len; ++i) {
        comment = comments[i];
        Object.defineProperty(comment.loc, "lines", { value: lines });
        pt.getEntry(comment, "end").comment = comment;
    }

    for (key in locs) {
        loc = locs[key];
        pair = key.split(",");

        sorted.push({
            line: +pair[0],
            column: +pair[1],
            startNode: loc.startNode,
            endNode: loc.endNode,
            comment: loc.comment
        });
    }

    sorted.sort(comparePos);

    var pendingComments = [];
    var previousNode;

    function addComment(node, comment) {
        if (node) {
            var comments = node.comments || (node.comments = []);
            comments.push(comment);
        }
    }

    function dumpTrailing() {
        pendingComments.forEach(function(comment) {
            addComment(previousNode, comment);
            comment.trailing = true;
        });

        pendingComments.length = 0;
    }

    sorted.forEach(function(entry) {
        if (entry.endNode) {
            // If we're ending a node with comments still pending, then we
            // need to attach those comments to the previous node before
            // updating the previous node.
            dumpTrailing();
            previousNode = entry.endNode;
        }

        if (entry.comment) {
            pendingComments.push(entry.comment);
        }

        if (entry.startNode) {
            var node = entry.startNode;
            var nodeStartColumn = node.loc.start.column;
            var didAddLeadingComment = false;
            var gapEndLoc = node.loc.start;

            // Iterate backwards through pendingComments, examining the
            // gaps between them. In order to earn the .possiblyLeading
            // status, a comment must be separated from entry.startNode by
            // an unbroken series of whitespace-only gaps.
            for (var i = pendingComments.length - 1; i >= 0; --i) {
                var comment = pendingComments[i];
                var gap = lines.slice(comment.loc.end, gapEndLoc);
                gapEndLoc = comment.loc.start;

                if (gap.isOnlyWhitespace()) {
                    comment.possiblyLeading = true;
                } else {
                    break;
                }
            }

            pendingComments.forEach(function(comment) {
                if (!comment.possiblyLeading) {
                    // If comment.possiblyLeading was not set to true
                    // above, the comment must be a trailing comment.
                    comment.trailing = true;
                    addComment(previousNode, comment);

                } else if (didAddLeadingComment) {
                    // If we previously added a leading comment to this
                    // node, then any subsequent pending comments must
                    // also be leading comments, even if they are indented
                    // more deeply than the node itself.
                    assert.strictEqual(comment.possiblyLeading, true);
                    comment.trailing = false;
                    addComment(node, comment);

                } else if (comment.type === "Line" &&
                           comment.loc.start.column > nodeStartColumn) {
                    // If the comment is a //-style comment and indented
                    // more deeply than the node itself, and we have not
                    // encountered any other leading comments, treat this
                    // comment as a trailing comment and add it to the
                    // previous node.
                    comment.trailing = true;
                    addComment(previousNode, comment);

                } else {
                    // Here we have the first leading comment for this node.
                    comment.trailing = false;
                    addComment(node, comment);
                    didAddLeadingComment = true;
                }
            });

            pendingComments.length = 0;

            // Note: the previous node is the node that started OR ended
            // most recently.
            previousNode = entry.startNode;
        }
    });

    // Provided we have a previous node to add them to, dump any
    // still-pending comments into the last node we came across.
    dumpTrailing();
};

var PosTracker = Visitor.extend({
    init: function() {
        this.locs = {};
    },

    getEntry: function(node, which) {
        var locs = this.locs,
            key = getKey(node, which);
        return key && (locs[key] || (locs[key] = {}));
    },

    onStart: function(node) {
        var entry = this.getEntry(node, "start");
        if (entry && !entry.startNode)
            entry.startNode = node;
    },

    onEnd: function(node) {
        var entry = this.getEntry(node, "end");
        if (entry)
            entry.endNode = node;
    },

    genericVisit: function(node) {
        this.onStart(node);
        this._super(node);
        this.onEnd(node);
    }
});

function getKey(node, which) {
    var loc = node && node.loc,
        pos = loc && loc[which];
    return pos && (pos.line + "," + pos.column);
}

function printLeadingComment(comment) {
    var orig = comment.original;
    var loc = orig && orig.loc;
    var lines = loc && loc.lines;
    var parts = [];

    if (comment.type === "Block") {
        parts.push("/*", comment.value, "*/");
    } else if (comment.type === "Line") {
        parts.push("//", comment.value);
    } else assert.fail(comment.type);

    if (comment.trailing) {
        // When we print trailing comments as leading comments, we don't
        // want to bring any trailing spaces along.
        parts.push("\n");

    } else if (lines instanceof Lines) {
        var trailingSpace = lines.slice(
            loc.end,
            lines.skipSpaces(loc.end)
        );

        if (trailingSpace.length === 1) {
            // If the trailing space contains no newlines, then we want to
            // preserve it exactly as we found it.
            parts.push(trailingSpace);
        } else {
            // If the trailing space contains newlines, then replace it
            // with just that many newlines, with all other spaces removed.
            parts.push(new Array(trailingSpace.length).join("\n"));
        }

    } else {
        parts.push("\n");
    }

    return concat(parts).stripMargin(loc ? loc.start.column : 0);
}

function printTrailingComment(comment) {
    var orig = comment.original;
    var loc = orig && orig.loc;
    var lines = loc && loc.lines;
    var parts = [];

    if (lines instanceof Lines) {
        var fromPos = lines.skipSpaces(loc.start, true) || lines.firstPos();
        var leadingSpace = lines.slice(fromPos, loc.start);

        if (leadingSpace.length === 1) {
            // If the leading space contains no newlines, then we want to
            // preserve it exactly as we found it.
            parts.push(leadingSpace);
        } else {
            // If the leading space contains newlines, then replace it
            // with just that many newlines, sans all other spaces.
            parts.push(new Array(leadingSpace.length).join("\n"));
        }
    }

    if (comment.type === "Block") {
        parts.push("/*", comment.value, "*/");
    } else if (comment.type === "Line") {
        parts.push("//", comment.value, "\n");
    } else assert.fail(comment.type);

    return concat(parts).stripMargin(
        loc ? loc.start.column : 0,
        true // Skip the first line, in case there were leading spaces.
    );
}

exports.printComments = function(comments, innerLines) {
    if (innerLines) {
        assert.ok(innerLines instanceof Lines);
    } else {
        innerLines = fromString("");
    }

    var count = comments ? comments.length : 0;
    if (count === 0) {
        return innerLines;
    }

    var parts = [];
    var leading = [];
    var trailing = [];

    comments.forEach(function(comment) {
        // For now, only /*comments*/ can be trailing comments.
        if (comment.type === "Block" &&
            comment.trailing) {
            trailing.push(comment);
        } else {
            leading.push(comment);
        }
    });

    leading.forEach(function(comment) {
        parts.push(printLeadingComment(comment));
    });

    parts.push(innerLines);

    trailing.forEach(function(comment) {
        parts.push(printTrailingComment(comment));
    });

    return concat(parts);
};
