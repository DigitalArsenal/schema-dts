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
 *
 * @fileoverview Baseline tests are a set of tests (in tests/baseline/) that
 * correspond to full comparisons of a generate .ts output based on a set of
 * Triples representing an entire ontology.
 */
import {basename} from 'path';

import {inlineCli} from '../helpers/main_driver';

test(`baseine_${basename(__filename)}`, async () => {
  const {actual} = await inlineCli(
    `
<http://schema.org/name> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/name> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/name> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/height> <http://schema.org/rangeIncludes> <http://schema.org/Number> .
<http://schema.org/height> <http://schema.org/domainIncludes> <http://schema.org/PersonLike> .
<http://schema.org/height> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/doors> <http://schema.org/rangeIncludes> <http://schema.org/Number> .
<http://schema.org/doors> <http://schema.org/domainIncludes> <http://schema.org/Vehicle> .
<http://schema.org/doors> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/doorNumber> <http://schema.org/rangeIncludes> <http://schema.org/Number> .
<http://schema.org/doorNumber> <http://schema.org/domainIncludes> <http://schema.org/Vehicle> .
<http://schema.org/doorNumber> <http://schema.org/domainIncludes> <http://schema.org/Car> .
<http://schema.org/doorNumber> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/PersonLike> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/PersonLike> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/Vehicle> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Vehicle> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/Car> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Car> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/doors> <http://schema.org/supersededBy> <http://schema.org/doorNumber> .
<http://schema.org/Vehicle> <http://schema.org/supersededBy> <http://schema.org/Car> .
<http://schema.org/names> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/names> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/names> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/names> <http://www.w3.org/2000/01/rdf-schema#comment> "Names are great!\\n <a href=\\"X\\">Y</a>" .
<http://schema.org/names> <http://schema.org/supersededBy> <http://schema.org/name> .
<http://schema.org/names> <http://schema.org/supersededBy> <http://schema.org/height> .
<http://schema.org/names2> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/names2> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/names2> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/names2> <http://www.w3.org/2000/01/rdf-schema#comment> "Names are great!\\n<br/><a href=\\"X\\">Y</a>" .
<http://schema.org/names2> <http://schema.org/supersededBy> <http://schema.org/name> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Number> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
<http://schema.org/Number> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
`,
    ['--ontology', `https://fake.com/${basename(__filename)}.nt`]
  );

  expect(actual).toMatchInlineSnapshot(`
"/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
export type WithContext<T extends Thing> = T & {
    \\"@context\\": \\"https://schema.org\\";
};
export interface Graph {
    \\"@context\\": \\"https://schema.org\\";
    \\"@graph\\": readonly Thing[];
}
type SchemaValue<T> = T | readonly T[];
type IdReference = {
    /** IRI identifying the canonical address of this object. */
    \\"@id\\": string;
};

export type Number = number | \`\${number}\`;

export type Text = string;

interface CarBase extends ThingBase {
    \\"doorNumber\\"?: SchemaValue<Number>;
}
interface CarLeaf extends CarBase {
    \\"@type\\": \\"Car\\";
}
export type Car = CarLeaf;

interface PersonLikeBase extends ThingBase {
    \\"height\\"?: SchemaValue<Number>;
}
interface PersonLikeLeaf extends PersonLikeBase {
    \\"@type\\": \\"PersonLike\\";
}
export type PersonLike = PersonLikeLeaf;

interface ThingBase extends Partial<IdReference> {
    \\"name\\"?: SchemaValue<Text>;
    /**
     * Names are great! {@link X Y}
     *
     * @deprecated Consider using http://schema.org/name or http://schema.org/height instead.
     */
    \\"names\\"?: SchemaValue<Text>;
    /**
     * Names are great!
     * {@link X Y}
     * @deprecated Consider using http://schema.org/name instead.
     */
    \\"names2\\"?: SchemaValue<Text>;
}
interface ThingLeaf extends ThingBase {
    \\"@type\\": \\"Thing\\";
}
export type Thing = ThingLeaf | Car | PersonLike | Vehicle;

interface VehicleBase extends ThingBase {
    \\"doorNumber\\"?: SchemaValue<Number>;
    /** @deprecated Consider using http://schema.org/doorNumber instead. */
    \\"doors\\"?: SchemaValue<Number>;
}
interface VehicleLeaf extends VehicleBase {
    \\"@type\\": \\"Vehicle\\";
}
/** @deprecated Use Car instead. */
export type Vehicle = VehicleLeaf;

"
`);
});
