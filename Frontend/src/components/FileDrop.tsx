import { useState } from 'react';
import { FaCloudArrowUp, FaFileLines, FaTrash } from 'react-icons/fa6';
import styled from 'styled-components';
import { Button, Muted } from './ui';

const Drop = styled.label<{ $dragging: boolean; $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  padding: ${({ $compact }) => ($compact ? '1rem' : '1.35rem')};
  border: 1.5px dashed
    ${({ $dragging, theme }) => ($dragging ? theme.colors.primary : theme.colors.border)};
  border-radius: 0;
  cursor: pointer;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ $dragging, theme }) =>
    $dragging ? theme.colors.primaryTint : theme.colors.cream};
  transition: border-color 0.15s ease, background 0.15s ease;

  input {
    display: none;
  }

  strong {
    color: ${({ theme }) => theme.colors.navy};
    font-weight: 700;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Uploaded = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.9rem 1rem;
  border-radius: 0;
  background: ${({ theme }) => theme.colors.successBg};
  border: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.success} 22%, transparent);
  color: ${({ theme }) => theme.colors.success};
`;

const FileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;

  span {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type Props = {
  fileName?: string;
  uploading?: boolean;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  compact?: boolean;
  accept?: string;
};

export function FileDrop({
  fileName,
  uploading,
  onUpload,
  onRemove,
  compact,
  accept = '.pdf,.jpg,.jpeg,.png',
}: Props) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onUpload(file);
  };

  if (fileName) {
    return (
      <Uploaded>
        <FileMeta>
          <FaFileLines />
          <span title={fileName}>{fileName}</span>
        </FileMeta>
        {onRemove && (
          <Button $variant="ghost" type="button" onClick={onRemove}>
            <FaTrash /> Remove
          </Button>
        )}
      </Uploaded>
    );
  }

  return (
    <Drop
      $dragging={dragging}
      $compact={compact}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <FaCloudArrowUp size={compact ? 18 : 22} />
      <strong>{uploading ? 'Uploading…' : 'Drop file or click to upload'}</strong>
      <Muted>PDF, JPG, or PNG · max 5 MB · test files only</Muted>
      <input
        type="file"
        accept={accept}
        disabled={uploading}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </Drop>
  );
}
