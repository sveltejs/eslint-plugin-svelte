export const language = {
  defaultToken: '',
  tokenPostfix: '.html',
  ignoreCase: true,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      [/<!DOCTYPE/, 'metatag', '@doctype'],
      [/<!--/, 'comment', '@comment'],
      [/\{/, 'delimiter', '@svelteMustache'],
      [
        /(<)((?:[\w-]+:)?[\w-]+)(\s*)(\/>)/,
        ['delimiter', 'tag', '', 'delimiter'],
      ],
      [/(<)(script)/, ['delimiter', { token: 'tag', next: '@script' }]],
      [/(<)(style)/, ['delimiter', { token: 'tag', next: '@style' }]],
      [
        /(<)((?:[\w-]+:)?[\w-]+)/,
        ['delimiter', { token: 'tag', next: '@otherTag' }],
      ],
      [
        /(<\/)((?:[\w-]+:)?[\w-]+)/,
        ['delimiter', { token: 'tag', next: '@otherTag' }],
      ],
      [/</, 'delimiter'],
      [/[^<{]+/], // text
    ],

    svelteMustache: [
      [/[\t\n\r ]+/], // whitespace
      [/(:)(else if)/, ['delimiter.svelte', 'keyword.flow']],
      [/([#/:@])([^\s}]+)/, ['delimiter.svelte', 'keyword.flow']],
      [/\}/, 'delimiter', '@pop'],
      [/\{/, 'delimiter.bracket', '@svelteMustacheInBrackets'],
      [
        /[^{}]/,
        {
          token: '@rematch',
          next: '@svelteScriptEmbedded',
          nextEmbedded: 'text/javascript',
        },
      ],
    ],
    svelteMustacheInBrackets: [
      [/\}/, 'delimiter.bracket', '@pop'],
      [/\{/, 'delimiter.bracket', '@push'],
      [
        /[^{}]/,
        {
          token: '@rematch',
          next: '@svelteScriptEmbedded',
          nextEmbedded: 'text/javascript',
        },
      ],
    ],
    svelteScriptEmbedded: [
      [
        /[{}]/,
        {
          token: '@rematch',
          next: '@pop',
          nextEmbedded: '@pop',
        },
      ],
      [/[^{}]+/],
    ],

    doctype: [
      [/[^>]+/, 'metatag.content'],
      [/>/, 'metatag', '@pop'],
    ],

    comment: [
      [/-->/, 'comment', '@pop'],
      [/[^-]+/, 'comment.content'],
      [/./, 'comment.content'],
    ],

    otherTag: [
      [/\/?>/, 'delimiter', '@pop'],
      [
        /([=])(["'])/,
        [
          'delimiter',
          {
            token: 'attribute.value',
            next: '@attributeValue.$2',
          },
        ],
      ],
      [
        /([=])(\s+)(["'])/,
        [
          'delimiter',
          '',
          {
            token: 'attribute.value',
            next: '@attributeValue.$3',
          },
        ],
      ],
      [/[=]\s*\{/, 'delimiter', '@svelteMustache'],
      [/"([^"]*)"/, 'attribute.value'],
      [/'([^']*)'/, 'attribute.value'],
      [
        /(\w+)(:)([\w-]+)/,
        ['keyword.flow', 'delimiter.svelte', 'attribute.name'],
      ],
      [/[\w-]+/, 'attribute.name'],
      [/[=]/, 'delimiter'],
      [/[\t\n\r ]+/], // whitespace
    ],

    attributeValue: [
      [
        /[\s\S]/,
        {
          cases: {
            '$0==$S2': { token: 'attribute.value', next: '@pop' },
            '$0=={': { token: 'delimiter', next: '@svelteMustache' },
            '@default': { token: 'attribute.value' },
          },
        },
      ],
    ],

    // -- BEGIN <script> tags handling

    // After <script
    script: [
      [/type/, 'attribute.name', '@scriptAfterType'],
      [/"([^"]*)"/, 'attribute.value'],
      [/'([^']*)'/, 'attribute.value'],
      [/[\w-]+/, 'attribute.name'],
      [/[=]/, 'delimiter'],
      [
        />/,
        {
          token: 'delimiter',
          next: '@scriptEmbedded',
          nextEmbedded: 'text/javascript',
        },
      ],
      [/[\t\n\r ]+/], // whitespace
      [
        /(<\/)(script\s*)(>)/,
        ['delimiter', 'tag', { token: 'delimiter', next: '@pop' }],
      ],
    ],

    // After <script ... type
    scriptAfterType: [
      [/[=]/, 'delimiter', '@scriptAfterTypeEquals'],
      [
        />/,
        {
          token: 'delimiter',
          next: '@scriptEmbedded',
          nextEmbedded: 'text/javascript',
        },
      ], // cover invalid e.g. <script type>
      [/[\t\n\r ]+/], // whitespace
      [/<\/script\s*>/, { token: '@rematch', next: '@pop' }],
    ],

    // After <script ... type =
    scriptAfterTypeEquals: [
      [
        /"([^"]*)"/,
        {
          token: 'attribute.value',
          switchTo: '@scriptWithCustomType.$1',
        },
      ],
      [
        /'([^']*)'/,
        {
          token: 'attribute.value',
          switchTo: '@scriptWithCustomType.$1',
        },
      ],
      [
        />/,
        {
          token: 'delimiter',
          next: '@scriptEmbedded',
          nextEmbedded: 'text/javascript',
        },
      ], // cover invalid e.g. <script type=>
      [/[\t\n\r ]+/], // whitespace
      [/<\/script\s*>/, { token: '@rematch', next: '@pop' }],
    ],

    // After <script ... type = $S2
    scriptWithCustomType: [
      [
        />/,
        {
          token: 'delimiter',
          next: '@scriptEmbedded.$S2',
          nextEmbedded: '$S2',
        },
      ],
      [/"([^"]*)"/, 'attribute.value'],
      [/'([^']*)'/, 'attribute.value'],
      [/[\w-]+/, 'attribute.name'],
      [/[=]/, 'delimiter'],
      [/[\t\n\r ]+/], // whitespace
      [/<\/script\s*>/, { token: '@rematch', next: '@pop' }],
    ],

    scriptEmbedded: [
      [/<\/script/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
      [/[^<]+/, ''],
    ],

    // -- END <script> tags handling

    // -- BEGIN <style> tags handling

    // After <style
    style: [
      [/type/, 'attribute.name', '@styleAfterType'],
      [/"([^"]*)"/, 'attribute.value'],
      [/'([^']*)'/, 'attribute.value'],
      [/[\w-]+/, 'attribute.name'],
      [/[=]/, 'delimiter'],
      [
        />/,
        {
          token: 'delimiter',
          next: '@styleEmbedded',
          nextEmbedded: 'text/css',
        },
      ],
      [/[\t\n\r ]+/], // whitespace
      [
        /(<\/)(style\s*)(>)/,
        ['delimiter', 'tag', { token: 'delimiter', next: '@pop' }],
      ],
    ],

    // After <style ... type
    styleAfterType: [
      [/[=]/, 'delimiter', '@styleAfterTypeEquals'],
      [
        />/,
        {
          token: 'delimiter',
          next: '@styleEmbedded',
          nextEmbedded: 'text/css',
        },
      ], // cover invalid e.g. <style type>
      [/[\t\n\r ]+/], // whitespace
      [/<\/style\s*>/, { token: '@rematch', next: '@pop' }],
    ],

    // After <style ... type =
    styleAfterTypeEquals: [
      [
        /"([^"]*)"/,
        {
          token: 'attribute.value',
          switchTo: '@styleWithCustomType.$1',
        },
      ],
      [
        /'([^']*)'/,
        {
          token: 'attribute.value',
          switchTo: '@styleWithCustomType.$1',
        },
      ],
      [
        />/,
        {
          token: 'delimiter',
          next: '@styleEmbedded',
          nextEmbedded: 'text/css',
        },
      ], // cover invalid e.g. <style type=>
      [/[\t\n\r ]+/], // whitespace
      [/<\/style\s*>/, { token: '@rematch', next: '@pop' }],
    ],

    // After <style ... type = $S2
    styleWithCustomType: [
      [
        />/,
        {
          token: 'delimiter',
          next: '@styleEmbedded.$S2',
          nextEmbedded: '$S2',
        },
      ],
      [/"([^"]*)"/, 'attribute.value'],
      [/'([^']*)'/, 'attribute.value'],
      [/[\w-]+/, 'attribute.name'],
      [/[=]/, 'delimiter'],
      [/[\t\n\r ]+/], // whitespace
      [/<\/style\s*>/, { token: '@rematch', next: '@pop' }],
    ],

    styleEmbedded: [
      [/<\/style/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
      [/[^<]+/, ''],
    ],

    // -- END <style> tags handling
  },
}
