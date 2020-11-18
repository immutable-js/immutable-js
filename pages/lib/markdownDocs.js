/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { Seq } = require('../../');
const markdown = require('./markdown');

function generate(defs) {
  function markdownDocs(defs) {
    markdownTypes(defs, []);

    function markdownTypes(typeDefs, path) {
      Seq(typeDefs).forEach((typeDef, typeName) => {
        const typePath = path.concat(typeName);
        markdownDoc(typeDef.doc, { typePath });
        typeDef.call &&
          markdownDoc(typeDef.call.doc, {
            typePath,
            signatures: typeDef.call.signatures,
          });
        if (typeDef.interface) {
          markdownDoc(typeDef.interface.doc, { defs, typePath });
          Seq(typeDef.interface.groups).forEach((group) =>
            Seq(group.members).forEach((member, memberName) =>
              markdownDoc(member.doc, {
                typePath: typePath.concat(memberName.slice(1)),
                signatures: member.signatures,
              })
            )
          );
        }
        typeDef.module && markdownTypes(typeDef.module, typePath);
      });
    }
  }

  function markdownDoc(doc, context) {
    if (!doc) {
      return;
    }
    doc.synopsis && (doc.synopsis = markdown(doc.synopsis, context, defs));
    doc.description &&
      (doc.description = markdown(doc.description, context, defs));
    doc.notes &&
      doc.notes.forEach((note) => {
        if (note.name !== 'alias') {
          note.body = markdown(note.body, context, defs);
        }
      });
  }

  return markdownDocs(defs);
}
module.exports = generate;
