-- Vídeos nos itens do portal e banner da home.

-- AlterEnum
ALTER TYPE "ContentKind" ADD VALUE 'BANNER';

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "content_images" ADD COLUMN "type" "MediaType" NOT NULL DEFAULT 'IMAGE';
