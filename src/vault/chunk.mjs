function normalizeContent(lines) {
  return lines.join("\n").trim();
}

export function chunkMarkdownDocument(document) {
  const lines = document.body.split("\n");
  const chunks = [];
  let currentHeading = null;
  let currentLines = [];

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      const content = normalizeContent(currentLines);
      if (currentHeading && content) {
        chunks.push({
          chunk_id: `${document.project}:${document.sourceRelpath}:${chunks.length}`,
          project: document.project,
          doc_type: document.docType,
          source_path: document.filePath,
          source_relpath: document.sourceRelpath,
          title: document.title,
          heading_path: `${document.title} > ${currentHeading}`,
          status: document.status,
          tags: document.tags,
          aliases: document.aliases,
          content,
          chunk_index: chunks.length,
          updated_at: document.updatedAt,
          token_count: content.split(/\s+/).filter(Boolean).length
        });
      }
      currentHeading = headingMatch[1].trim();
      currentLines = [];
      continue;
    }

    if (/^#\s+/.test(line)) continue;
    currentLines.push(line);
  }

  const finalContent = normalizeContent(currentLines);
  if (currentHeading && finalContent) {
    chunks.push({
      chunk_id: `${document.project}:${document.sourceRelpath}:${chunks.length}`,
      project: document.project,
      doc_type: document.docType,
      source_path: document.filePath,
      source_relpath: document.sourceRelpath,
      title: document.title,
      heading_path: `${document.title} > ${currentHeading}`,
      status: document.status,
      tags: document.tags,
      aliases: document.aliases,
      content: finalContent,
      chunk_index: chunks.length,
      updated_at: document.updatedAt,
      token_count: finalContent.split(/\s+/).filter(Boolean).length
    });
  }

  if (chunks.length === 0) {
    const content = normalizeContent(lines.filter((line) => !/^#\s+/.test(line)));
    if (content) {
      chunks.push({
        chunk_id: `${document.project}:${document.sourceRelpath}:0`,
        project: document.project,
        doc_type: document.docType,
        source_path: document.filePath,
        source_relpath: document.sourceRelpath,
        title: document.title,
        heading_path: document.title,
        status: document.status,
        tags: document.tags,
        aliases: document.aliases,
        content,
        chunk_index: 0,
        updated_at: document.updatedAt,
        token_count: content.split(/\s+/).filter(Boolean).length
      });
    }
  }

  return chunks;
}
