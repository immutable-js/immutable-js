export type TypeDefs = {
  version: string;
  doc?: TypeDoc;
  types: { [name: string]: TypeDefinition };
};

export type TypeDefinition = {
  qualifiedName: string;
  label: string; // Like a name, but with () for callables.
  url: string;
  doc?: TypeDoc;
  call?: MemberDefinition;
  functions?: { [name: string]: MemberDefinition };
  interface?: InterfaceDefinition;
};

export type MemberDefinition = {
  line: number;
  name: string;
  label: string; // Like a name, but with () for callables.
  url: string;
  id: string; // Local reference on a page
  group?: string;
  doc?: TypeDoc;
  isStatic?: boolean;
  inherited?: { interface: string; label: string; url: string };
  overrides?: { interface: string; label: string; url: string };
  signatures?: Array<CallSignature>;
  type?: Type;
};

export type CallSignature = {
  line?: number;
  typeParams?: Array<string>;
  params?: Array<CallParam>;
  type?: Type;
};

export type CallParam = {
  name: string;
  type: Type;
  varArgs?: boolean;
  optional?: boolean;
};

export type InterfaceDefinition = {
  doc?: TypeDoc;
  line?: number;
  typeParams?: Array<string>;
  extends?: Array<NamedType>;
  implements?: Array<NamedType>;
  members: { [name: string]: MemberDefinition };
};

export type MemberGroup = {
  title?: string;
  members: { [name: string]: MemberDefinition };
};

export type TypeDoc = {
  synopsis: string;
  notes: Array<TypeDocNote>;
  description: string;
};

type TypeDocNote = { name: string; body: string };

export enum TypeKind {
  Never,
  Any,
  Unknown,
  This,

  Undefined,
  Boolean,
  Number,
  String,

  Object,
  Array,
  Function,
  Param,
  Type,

  Union,
  Intersection,
  Tuple,
  Indexed,
  Operator,
}

export type Type =
  | NeverType
  | AnyType
  | UnknownType
  | ThisType
  | UndefinedType
  | BooleanType
  | NumberType
  | StringType
  | UnionType
  | IntersectionType
  | TupleType
  | ObjectType
  | ArrayType
  | FunctionType
  | ParamType
  | NamedType
  | IndexedType
  | OperatorType;

type NeverType = { k: TypeKind.Never };
type AnyType = { k: TypeKind.Any };
type UnknownType = { k: TypeKind.Unknown };
type ThisType = { k: TypeKind.This };

type UndefinedType = { k: TypeKind.Undefined };
type BooleanType = { k: TypeKind.Boolean };
type NumberType = { k: TypeKind.Number };
type StringType = { k: TypeKind.String };

type ObjectType = {
  k: TypeKind.Object;
  members: Array<ObjectMember>;
};
export type ObjectMember = {
  index?: boolean;
  name?: string;
  params?: Array<CallParam>;
  type?: Type;
};

type ArrayType = { k: TypeKind.Array; type: Type };
export type FunctionType = {
  k: TypeKind.Function;
  // Note: does not yet show constraints or defaults
  typeParams?: Array<string>;
  params: Array<CallParam>;
  type: Type;
};
export type ParamType = { k: TypeKind.Param; param: string };
export type NamedType = {
  k: TypeKind.Type;
  name: string; // May be dotted path or other expression
  args?: Array<Type>;
  url?: string;
};

type UnionType = { k: TypeKind.Union; types: Array<Type> };
type IntersectionType = { k: TypeKind.Intersection; types: Array<Type> };
type TupleType = { k: TypeKind.Tuple; types: Array<Type> };
type IndexedType = { k: TypeKind.Indexed; type: Type; index: Type };
type OperatorType = { k: TypeKind.Operator; operator: string; type: Type };
