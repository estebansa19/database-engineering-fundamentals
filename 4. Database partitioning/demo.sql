-- crear tabla principal e insertar información (10M rows)
create table grades (id serial not null, g int not null);
insert into grades(g) select floor(random() * 100) from generate_series (0, 10000000);
create index grades_idx on grades(g);

-- crear tabla principal de partitions y sub-tablas de partitions
create table grades_parts (id serial not null, g int not null) partition by range(g);
create table g0035 (like grades_parts including indexes);
create table g3560 (like grades_parts including indexes);
create table g6080 (like grades_parts including indexes);
create table g80100 (like grades_parts including indexes);

-- attach sub-tablas de partitions a la tabla principal de partitions
alter table grades_parts attach partition g0035 for values from (0) to (35);
alter table grades_parts attach partition g3560 for values from (35) to (60);
alter table grades_parts attach partition g6080 for values from (60) to (80);
alter table grades_parts attach partition g80100 for values from (80) to (100);

-- pasar información de la tabla principal a la tabla principal de partitions.
-- Postgres sabrá en qué tabla debe insertar la información de acuerdo al rango en g de cada
-- registro.
insert into grades_parts select * from grades;

-- crear un index en la tabla principal de partitions (se ve reflejado en todas las sub-tablas de partitions)
create index grades_parts_idx on grades_parts(g);

-- y listo xD
