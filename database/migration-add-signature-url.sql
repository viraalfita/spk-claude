-- Migration: Add signature_url column to spk table
-- This allows storing the signature image URL for QR code generation in PDFs

ALTER TABLE spk ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN spk.signature_url IS 'URL of the uploaded signature image used for QR code generation in PDF';
