const HEADING_TO_DOC_TYPE = {
  "Architecture": "architecture",
  "Decisions": "decision",
  "Runbooks": "runbook",
  "Reference": "reference",
  "Landscape": "landscape",
  "Hypotheses": "hypothesis",
  "Ideas": "idea",
  "Experiments": "experiment",
  "Strategy": "strategy",
  "Topics": "topic",
  "Production": "production",
};

function normalizeContent(lines) {
  return lines.join("\n").trim();
}

function docTypeFromHeading(heading) {
  return HEADING_TO_DOC_TYPE[heading] ?? "reference";
}

export function chunkMarkdownDocument(document) {
  const lines = document.body.split("\n");
  const chunks = [];
  let currentHeading = null;
  let currentDocType = null;
  let currentLines = [];
  let introLines = [];
  let seenFirstSection = false;

  for (const line of lines) {
    if (/^#\s+/.test(line) && !/^##\s+/.test(line)) continue;

    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      if (!seenFirstSection) {
        seenFirstSection = true;
        const introContent = normalizeContent(introLines);
        if (introContent) {
          chunks.push({
            chunk_id: `${document.project}:${document.sourceRelpath}:overview`,
            project: document.project,
            doc_type: "overview",
            source_path: document.filePath,
            source_relpath: document.sourceRelpath,
            title: document.title,
            heading_path: document.title,
            status: document.status,
            tags: document.tags,
            aliases: document.aliases,
            content: introContent,
            chunk_index: chunks.length,
            updated_at: document.updatedAt,
            token_count: introContent.split(/\s+/).filter(Boolean).length
          });
        }
      } else {
        const content = normalizeContent(currentLines);
        if (currentHeading && content) {
          chunks.push({
            chunk_id: `${document.project}:${document.sourceRelpath}:${chunks.length}`,
            project: document.project,
            doc_type: currentDocType,
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
      }
      currentHeading = headingMatch[1].trim();
      currentDocType = docTypeFromHeading(currentHeading);
      currentLines = [];
      continue;
    }

    if (!seenFirstSection) {
      introLines.push(line);
    } else {
      currentLines.push(line);
    }
  }

  const finalContent = normalizeContent(currentLines);
  if (currentHeading && finalContent) {
    chunks.push({
      chunk_id: `${document.project}:${document.sourceRelpath}:${chunks.length}`,
      project: document.project,
      doc_type: currentDocType,
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
    const content = normalizeContent(lines.filter((l) => !/^#+\s/.test(l)));
    if (content) {
      chunks.push({
        chunk_id: `${document.project}:${document.sourceRelpath}:0`,
        project: document.project,
        doc_type: "overview",
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
