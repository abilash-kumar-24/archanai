-- Priest gender (optional) and willingness to travel outside the home city, for browse filters.
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
ALTER TABLE "priests" ADD COLUMN "gender" "Gender";
ALTER TABLE "priests" ADD COLUMN "travels_outside_city" BOOLEAN NOT NULL DEFAULT false;
