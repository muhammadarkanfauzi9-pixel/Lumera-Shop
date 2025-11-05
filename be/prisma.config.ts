const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });


import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"), 
  },
});