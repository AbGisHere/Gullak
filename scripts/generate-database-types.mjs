import { writeFileSync } from "node:fs";

// Introspects the migrated temporary Postgres schema. No hosted account is accessed.
export function generateDatabaseTypes(query) {
  const type = (sqlType) => {
    if (sqlType.endsWith("[]")) return `${type(sqlType.slice(0, -2))}[]`;
    if (["json", "jsonb"].includes(sqlType)) return "Json";
    if (sqlType === "boolean") return "boolean";
    if (["bigint", "integer", "smallint", "real", "double precision", "numeric"].includes(sqlType)) return "number";
    if (sqlType === "void") return "undefined";
    if (["uuid", "text", "timestamp with time zone"].includes(sqlType)) return "string";
    throw new Error(`Unsupported database type: ${sqlType}`);
  };
  const tables = JSON.parse(
    query(`select coalesce(json_agg(t order by t.name),'[]') from (
    select c.relname as name, c.relkind as kind,
      (select json_agg(json_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),
        'nullable',not a.attnotnull,'default',a.atthasdef) order by a.attnum)
       from pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped) as columns,
      (select coalesce(json_agg(json_build_object('foreignKeyName',f.conname,
        'columns',(select json_agg(a.attname order by k.i) from generate_subscripts(f.conkey,1) k(i) join pg_attribute a on a.attrelid=f.conrelid and a.attnum=f.conkey[k.i]),
        'isOneToOne',exists(select 1 from pg_constraint u where u.conrelid=f.conrelid and u.contype in ('p','u') and u.conkey @> f.conkey and u.conkey <@ f.conkey),
        'referencedRelation',(select relname from pg_class where oid=f.confrelid),
        'referencedColumns',(select json_agg(a.attname order by k.i) from generate_subscripts(f.confkey,1) k(i) join pg_attribute a on a.attrelid=f.confrelid and a.attnum=f.confkey[k.i])) order by f.conname),'[]')
       from pg_constraint f where f.conrelid=c.oid and f.contype='f' and f.confrelid in (select oid from pg_class where relnamespace='public'::regnamespace)) as relationships
    from pg_class c where c.relnamespace='public'::regnamespace and c.relkind in ('r','v')) t;`),
  );
  const functions = JSON.parse(
    query(`select coalesce(json_agg(t order by t.name),'[]') from (
    select p.proname as name,format_type(p.prorettype,null) as returns,
      (select coalesce(json_agg(json_build_object('name',p.proargnames[i+1],'type',format_type(p.proargtypes[i],null),'optional',i>=p.pronargs-p.pronargdefaults) order by i),'[]') from generate_series(0,p.pronargs-1) i) as args
    from pg_proc p where p.pronamespace='public'::regnamespace and p.prokind='f' and p.proname not like 'test_%') t;`),
  );
  const lines = [
    "// Generated from an isolated PostgreSQL database after applying committed migration files.",
    "// Regenerate: node scripts/test-database.mjs <postgres-bin> --generate-types",
    "// This is local migration evidence, not verification of the shared Supabase schema.",
    "export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];",
    "export type Database = { public: { Tables: {",
  ];
  const emitRelation = (table) => {
    lines.push(`${JSON.stringify(table.name)}: {`);
    for (const mode of table.kind === "v" ? ["Row"] : ["Row", "Insert", "Update"]) {
      lines.push(`${mode}: {`);
      for (const c of table.columns) {
        const optional = mode === "Update" || (mode === "Insert" && (c.nullable || c.default));
        lines.push(`${JSON.stringify(c.name)}${optional ? "?" : ""}: ${type(c.type)}${c.nullable ? " | null" : ""};`);
      }
      lines.push("};");
    }
    lines.push(`Relationships: ${JSON.stringify(table.relationships)}; };`);
  };
  for (const table of tables.filter((table) => table.kind === "r")) emitRelation(table);
  lines.push("}; Views: {");
  for (const view of tables.filter((table) => table.kind === "v")) emitRelation(view);
  lines.push("}; Functions: {");
  const grouped = new Map();
  for (const f of functions) {
    const existing = grouped.get(f.name);
    if (!existing || f.args.length > existing.args.length) grouped.set(f.name, f);
  }
  for (const f of grouped.values()) {
    const args = f.args.length
      ? `{ ${f.args.map((a) => `${JSON.stringify(a.name)}${a.optional || (f.name === "record_quiz" && a.name === "p_evidence") ? "?" : ""}: ${type(a.type)};`).join(" ")} }`
      : "Record<string, never>";
    lines.push(`${JSON.stringify(f.name)}: { Args: ${args}; Returns: ${type(f.returns)} };`);
  }
  lines.push(
    "}; Enums: { [_ in never]: never }; CompositeTypes: { [_ in never]: never }; }; };",
    'export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];',
    'export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];',
  );
  writeFileSync(new URL("../apps/web/lib/data/database.types.ts", import.meta.url), `${lines.join("\n")}\n`);
}
