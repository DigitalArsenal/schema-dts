/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createPrinter,
  createSourceFile,
  EmitHint,
  NewLineKind,
  ScriptKind,
  ScriptTarget,
} from 'typescript';

import {SchemaString, UrlNode} from '../../src/triples/types';
import {
  AliasBuiltin,
  Class,
  DataTypeUnion,
  Sort,
  Builtin,
} from '../../src/ts/class';
import {Context} from '../../src/ts/context';
import {makeClass, makeClassMap} from '../helpers/make_class';

describe('Class', () => {
  let cls: Class;
  beforeEach(() => {
    cls = makeClass('https://schema.org/Person');
  });

  it('not deprecated by default', () => {
    expect(cls.deprecated).toBe(false);
  });

  describe('add errors', () => {
    it('add parent with missing class', () => {
      expect(() =>
        cls.add(
          {
            Predicate: subClassOf(),
            Object: UrlNode.Parse('https://schema.org/Thing'),
          },
          makeClassMap(cls)
        )
      ).toThrowError("Couldn't find parent");
    });

    it('add parent with missing class', () => {
      expect(() =>
        cls.add(
          {
            Predicate: supersededBy(),
            Object: UrlNode.Parse('https://schema.org/CoolPerson'),
          },
          makeClassMap(cls)
        )
      ).toThrowError("Couldn't find class https://schema.org/CoolPerson");
    });
  });

  describe('toNode', () => {
    it('by default (no parent)', () => {
      // A class with no parent has a top-level "@id"
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "type PersonBase = Partial<IdReference>;
        type PersonLeaf = {
            \\"@type\\": \\"Person\\";
        } & PersonBase;
        export type Person = PersonLeaf;"
      `);
    });

    it('empty (with parent)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "type PersonLeaf = {
            \\"@type\\": \\"Person\\";
        } & ThingBase;
        export type Person = PersonLeaf;"
      `);
    });

    it('empty (two parents)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing1');
      addParent(cls, 'https://schema.org/Thing2');

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "type PersonBase = (Thing1Base & Thing2Base);
        type PersonLeaf = {
            \\"@type\\": \\"Person\\";
        } & PersonBase;
        export type Person = PersonLeaf;"
      `);
    });

    it('deprecated once (only)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(
        cls.add(
          {
            Predicate: supersededBy(),
            Object: UrlNode.Parse('https://schema.org/CoolPerson'),
          },
          makeClassMap(cls, makeClass('https://schema.org/CoolPerson'))
        )
      ).toBe(true);

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "type PersonLeaf = {
            \\"@type\\": \\"Person\\";
        } & ThingBase;
        /** @deprecated Use CoolPerson instead. */
        export type Person = PersonLeaf;"
      `);
    });

    it('deprecated twice (alphabetical)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      const map = makeClassMap(
        cls,
        makeClass('https://schema.org/CoolPerson'),
        makeClass('https://schema.org/APerson')
      );

      expect(
        cls.add(
          {
            Predicate: supersededBy(),
            Object: UrlNode.Parse('https://schema.org/CoolPerson'),
          },
          map
        )
      ).toBe(true);

      expect(
        cls.add(
          {
            Predicate: supersededBy(),
            Object: UrlNode.Parse('https://schema.org/APerson'),
          },
          map
        )
      ).toBe(true);

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "type PersonLeaf = {
            \\"@type\\": \\"Person\\";
        } & ThingBase;
        /** @deprecated Use APerson or CoolPerson instead. */
        export type Person = PersonLeaf;"
      `);
    });

    it('deprecated with comment', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(
        cls.add(
          {
            Predicate: supersededBy(),
            Object: UrlNode.Parse('https://schema.org/CoolPerson'),
          },
          makeClassMap(cls, makeClass('https://schema.org/CoolPerson'))
        )
      ).toBe(true);
      expect(
        cls.add(
          {
            Predicate: comment(),
            Object: new SchemaString('Fantastic', 'en'),
          },
          new Map()
        )
      ).toBe(true);

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "type PersonLeaf = {
            \\"@type\\": \\"Person\\";
        } & ThingBase;
        /**
         * Fantastic
         * @deprecated Use CoolPerson instead.
         */
        export type Person = PersonLeaf;"
      `);
    });

    it('complains about bad comment markup', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(
        cls.add(
          {
            Predicate: comment(),
            Object: new SchemaString(
              'Hello World. ' +
                '<table>' +
                '<tr><td>XYZ</td><td>ABC</td></tr>' +
                '<tr><td>123</td><td>234</td></tr>' +
                '</table>',
              undefined
            ),
          },
          new Map()
        )
      ).toBe(true);

      expect(() => cls.toNode(ctx, true)).toThrowError('Unknown tag');
    });
  });
});

describe('Sort(Class, Class)', () => {
  describe('Two regulars', () => {
    it('By name', () => {
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          makeClass('https://schema.org/B')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://schema.org/B'),
          makeClass('https://schema.org/A')
        )
      ).toBe(+1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          makeClass('https://schema.org/A')
        )
      ).toBe(0);

      expect(
        Sort(makeClass('https://schema.org/A'), makeClass('https://foo.bar/B'))
      ).toBe(-1);
      expect(
        Sort(makeClass('https://schema.org/B'), makeClass('https://foo.bar/A'))
      ).toBe(+1);

      expect(
        Sort(
          makeClass('https://schema.org/Z'),
          makeClass('https://schema.org/Z#A')
        )
      ).toBe(+1);
    });

    it('Same name different URL', () => {
      expect(
        Sort(makeClass('https://schema.org/A'), makeClass('https://foo.bar/A'))
      ).toBe(+1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          makeClass('https://z.org/2010#A')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          makeClass('https://schema.org/Z#A')
        )
      ).toBe(-1);
    });

    it('DataType comes first', () => {
      // Before regular classes.
      expect(
        Sort(
          new AliasBuiltin('https://schema.org/Text', 'string'),
          makeClass('https://schema.org/A')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          new AliasBuiltin('https://schema.org/Text', 'string')
        )
      ).toBe(+1);

      // Before regular classes with different domains.
      expect(
        Sort(
          new AliasBuiltin('https://schema.org/Text', 'string'),
          makeClass('https://a.org/DataType')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://a.org/DataType'),
          new AliasBuiltin('https://schema.org/Text', 'string')
        )
      ).toBe(+1);

      // Before builtins.
      expect(
        Sort(
          new DataTypeUnion('https://schema.org/DataType', []),
          new AliasBuiltin('https://schema.org/A', 'string')
        )
      ).toBe(+1);
      expect(
        Sort(
          new AliasBuiltin('https://schema.org/A', 'string'),
          new DataTypeUnion('https://schema.org/DataType', [])
        )
      ).toBe(-1);
      expect(
        Sort(
          new AliasBuiltin('https://schema.org/Z', 'string'),
          new DataTypeUnion('https://schema.org/DataType', [])
        )
      ).toBe(-1);

      // Can be same as less specific builtins.
      expect(
        Sort(
          new Builtin(UrlNode.Parse('https://schema.org/Boo'), false),
          new AliasBuiltin('https://schema.org/Boo', 'Text')
        )
      ).toBe(0);

      // Sorts within Builtins
      expect(
        Sort(
          new AliasBuiltin('https://schema.org/A', 'string'),
          new AliasBuiltin('https://schema.org/B', 'string')
        )
      ).toBe(-1);

      expect(
        Sort(
          new AliasBuiltin('https://schema.org/B', 'string'),
          new AliasBuiltin('https://schema.org/A', 'string')
        )
      ).toBe(+1);

      expect(
        Sort(
          new AliasBuiltin('https://schema.org/C', 'string'),
          new AliasBuiltin('https://schema.org/C', 'string')
        )
      ).toBe(0);

      expect(
        Sort(
          new AliasBuiltin('https://schema.org/A#Z', 'string'),
          new AliasBuiltin('https://schema.org/C', 'string')
        )
      ).toBe(+1);
      expect(
        Sort(
          new AliasBuiltin('https://z.org/C', 'string'),
          new AliasBuiltin('https://schema.org/C', 'string')
        )
      ).toBe(+1);
      expect(
        Sort(
          new AliasBuiltin('https://z.org/Z#A', 'string'),
          new AliasBuiltin('https://schema.org/C', 'string')
        )
      ).toBe(-1);
    });

    it('DataType union comes next', () => {
      // Before regular classes.
      expect(
        Sort(
          new DataTypeUnion('https://schema.org/DataType', []),
          makeClass('https://schema.org/A')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          new DataTypeUnion('https://schema.org/DataType', [])
        )
      ).toBe(+1);

      // Before regular classes with different domains.
      expect(
        Sort(
          new DataTypeUnion('https://schema.org/DataType', []),
          makeClass('https://a.org/DataType')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://a.org/DataType'),
          new DataTypeUnion('https://schema.org/DataType', [])
        )
      ).toBe(+1);
    });

    it('DataType union is equal', () => {
      expect(
        Sort(
          new DataTypeUnion('https://schema.org/DataType', []),
          new DataTypeUnion('https://schema.org/DataType', [])
        )
      ).toBe(0);

      expect(
        Sort(
          new DataTypeUnion('https://schema.org/A', []),
          new DataTypeUnion('https://schema.org/Z', [])
        )
      ).toBe(0);

      expect(
        Sort(
          new DataTypeUnion('https://schema.org/Z', []),
          new DataTypeUnion('https://schema.org/A', [])
        )
      ).toBe(0);
    });
  });
});

function asString(
  cls: Class,
  context: Context,
  {skipDeprecated}: {skipDeprecated?: boolean} = {}
): string {
  const source = createSourceFile(
    'result.ts',
    '',
    ScriptTarget.ES2015,
    /*setParentNodes=*/ false,
    ScriptKind.TS
  );
  const printer = createPrinter({newLine: NewLineKind.LineFeed});

  return cls
    .toNode(context, !!skipDeprecated)
    .map(node => printer.printNode(EmitHint.Unspecified, node, source))
    .join('\n');
}

function subClassOf(): UrlNode {
  return UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#subClassOf');
}

function supersededBy(): UrlNode {
  return UrlNode.Parse('https://schema.org/supersededBy');
}

function comment(): UrlNode {
  return UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#comment');
}

function addParent(cls: Class, parentUrl: string): void {
  expect(
    cls.add(
      {Predicate: subClassOf(), Object: UrlNode.Parse(parentUrl)},
      makeClassMap(cls, makeClass(parentUrl))
    )
  ).toBe(true);
}
