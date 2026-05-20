import { Pool } from 'pg'
import { parse, HTMLElement } from 'node-html-parser'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Convert an HTML element to Lexical nodes
function htmlToLexicalNodes(html: string): any[] {
  const root = parse(html)
  const nodes: any[] = []

  function processNode(el: HTMLElement): any | null {
    const tag = el.tagName?.toLowerCase()

    // Headings
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      return {
        type: 'heading',
        tag,
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        children: [
          {
            type: 'text',
            text: el.innerText.trim(),
            version: 1,
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
          },
        ],
      }
    }

    // Skip style, script, iframe
    if (tag === 'style' || tag === 'script' || tag === 'iframe') {
      return null
    }

    // Paragraph
    if (tag === 'p') {
      // Strip WP shortcodes like [playlist ids="123"]
      const text = el.innerText.trim().replace(/\[[\s\S]*?\]/g, '').trim()
      if (!text) return null
      return {
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        children: [
          { type: 'text', text, version: 1, format: 0, detail: 0, mode: 'normal', style: '' },
        ],
      }
    }

    // Unordered list
    if (tag === 'ul') {
      const items = el.querySelectorAll('li').map((li) => ({
        type: 'listitem',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        value: 1,
        checked: undefined,
        children: [
          {
            type: 'text',
            text: li.innerText.trim(),
            version: 1,
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
          },
        ],
      }))
      if (!items.length) return null
      return {
        type: 'list',
        listType: 'bullet',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        start: 1,
        tag: 'ul',
        children: items,
      }
    }

    // Ordered list
    if (tag === 'ol') {
      const items = el.querySelectorAll('li').map((li, i) => ({
        type: 'listitem',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        value: i + 1,
        checked: undefined,
        children: [
          {
            type: 'text',
            text: li.innerText.trim(),
            version: 1,
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
          },
        ],
      }))
      if (!items.length) return null
      return {
        type: 'list',
        listType: 'number',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        start: 1,
        tag: 'ol',
        children: items,
      }
    }

    // Div — recurse into children
    if (tag === 'div' || tag === 'section') {
      const results: any[] = []
      for (const child of el.childNodes) {
        if (child instanceof HTMLElement) {
          const result = processNode(child)
          if (Array.isArray(result)) results.push(...result)
          else if (result) results.push(result)
        }
      }
      return results
    }

    // Fallback — treat as paragraph if has text
    const text = el.innerText?.trim()
    if (text) {
      return {
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        children: [
          { type: 'text', text, version: 1, format: 0, detail: 0, mode: 'normal', style: '' },
        ],
      }
    }

    return null
  }

  for (const child of root.childNodes) {
    if (child instanceof HTMLElement) {
      const result = processNode(child)
      if (Array.isArray(result)) {
        nodes.push(...result)
      } else if (result) {
        nodes.push(result)
      }
    }
  }

  return nodes
}

async function convert() {
  const { rows: blocks } = await pool.query(
    `SELECT id, rich_text FROM pages_blocks_content_columns`,
  )

  console.log(`Found ${blocks.length} content blocks\n`)

  let updated = 0
  let skipped = 0

  for (const block of blocks) {
    const richText = block.rich_text
    if (!richText?.root?.children) {
      skipped++
      continue
    }

    const children = richText.root.children
    let needsConversion = false

    for (const child of children) {
      if (
        child.type === 'paragraph' &&
        child.children?.length === 1 &&
        child.children[0].type === 'text' &&
        child.children[0].text?.includes('<')
      ) {
        needsConversion = true
        break
      }
    }

    if (!needsConversion) {
      skipped++
      continue
    }

    console.log(`Converting block ${block.id}...`)

    const newChildren: any[] = []

    for (const child of children) {
      if (
        child.type === 'paragraph' &&
        child.children?.length === 1 &&
        child.children[0].type === 'text' &&
        child.children[0].text?.includes('<')
      ) {
        const htmlContent = child.children[0].text
        const lexicalNodes = htmlToLexicalNodes(htmlContent)
        console.log(`  → Converted to ${lexicalNodes.length} Lexical nodes`)
        newChildren.push(...lexicalNodes)
      } else {
        newChildren.push(child)
      }
    }

    const newRichText = {
      ...richText,
      root: {
        ...richText.root,
        children: newChildren,
      },
    }

    await pool.query(`UPDATE pages_blocks_content_columns SET rich_text = $1 WHERE id = $2`, [
      newRichText,
      block.id,
    ])

    console.log(`✓ Updated block ${block.id}\n`)
    updated++
  }

  await pool.end()

  console.log('--- Summary ---')
  console.log(`✓ Converted: ${updated}`)
  console.log(`↺ Skipped:   ${skipped}`)

  process.exit(0)
}

convert().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
