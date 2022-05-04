import { stat, readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';

// TODO?: process streams rather than batch text
export async function preprocess(inputFile) {
  const stats = await stat(inputFile);
  if (!stats.isFile()) {
    throw new Error(`Input file is not a regular file: ${inputFile}`);
  }

  // return readable stream with pre-processed inputs
  const stream = new Readable();
  process(
    await readFile(inputFile, 'utf8'),
    s => stream.push(s, 'utf8')
  );
  stream.push(null);
  return stream;
}

export function process(input, out) {
  scan(context(input, out));
}

function context(input, out) {
  const NOTSPACE = /\S/;
  const SPACE = /\s/;
  const WORD = /\w/;
  const n = input.length;
  let a = 0;

  return {
    n,
    input,
    derive(str) {
      return context(str, out);
    },
    write(i, s, ii = i) {
      if (a < i) out(input.slice(a, i));
      if (s) out(s);
      a = ii;
    },
    peek(i, s) {
      const m = s.length;
      for (let j = 0; j < m; ++j) {
        if (input[i + j] !== s[j]) return false;
      }
      return true;
    },
    consume(i, c) {
      for (; input[i] === c; ++i) {}
      return i;
    },
    space(i) {
      for (; input[i] === ' '; ++i) {}
      return i;
    },
    ws(i) {
      for (; i < n && SPACE.test(input[i]); ++i) {}
      return i;
    },
    notspace(i) {
      for (; i < n && NOTSPACE.test(input[i]); ++i) {}
      return i;
    },
    word(i) {
      for (; i < n && WORD.test(input[i]); ++i) {}
      return i;
    },
    sub(i, j) {
      return input.slice(i, j);
    }
  }
}

function scan(_) {
  const { input, n } = _;
  const spans = [];
  const links = [];
  const attrs = [];
  const backs = [];
  const qdoub = [];
  const qsing = [];
  const codeq = [];
  const codet = [];
  const fdivs = [];
  let i = -1, j, k;
  let c = '\n', cc;

  while (i < n) {
    switch (c) {
      case '\\':
        i += 2;
        break;
      case '\r':
      case '\n':
        // TODO? handle closing fence on same line (```, ~~~)
        i = _.ws(++i);
        cc = _.peek(i, ':::') ? ':'
          : _.peek(i, '~~~') ? '~'
          : _.peek(i, '```') ? '`' : '';
        if (cc) {
          _.write(i = _.space(_.consume(i, cc)));

          // early exit if fence closing
          if (cc === '`' && codeq.length) {
            codeq.pop();
            break;
          } else if (cc === `~` && codet.length) {
            codet.pop();
            break;
          } else if (cc === ':' && fdivs.length) {
            fdivs.pop();
            break;
          }

          // otherwise process attributes and update state
          j = _.word(i);
          if (_.peek(k = _.space(j), '{')) {
            if (j > i) {
              _.write(i, `{.${_.sub(i, j)} `, k + 1);
            }
            i = k + 1;
            attrs.push(i);
          }
          if (cc === '`') {
            codeq.push(i);
          } else if (cc === '~') {
            codet.push(i);
          } else if (cc === ':') {
            fdivs.push(i);
          }
        }
        break;
      case '[':
        if (!attrs.length && !backs.length) {
          spans.push(i + 1);
        }
        ++i;
        break;
      case ']':
        ++i;
        if (!attrs.length && !backs.length && spans.length) {
          spans.pop();
          if (_.peek(i, '(')) {
            links.push(i++);
          } else if (_.peek(i, '{')) {
            attrs.push(i++);
          }
        }
        break;
      case ')':
        ++i;
        if (links.length && !backs.length && !qdoub.length && !qsing.length) {
          j = links.pop();
          _.write(j + 1, link(_.sub(j + 1, i - 1)), i - 1);
          if (_.peek(i, '{')) {
            attrs.push(i++);
          }
        }
        break;
      case '"':
        if (!qsing.length && !backs.length) {
          qdoub.length ? qdoub.pop() : qdoub.push(i);
        }
        ++i;
        break;
      case '\'':
        if (!qdoub.length && !backs.length) {
          qsing.length ? qsing.pop() : qsing.push(i);
        }
        ++i;
        break;
      case '`':
        if (codeq.length || codet.length) {
          ++i;
        } else if (backs.length) {
          const [k, l] = backs[backs.length - 1];
          j = _.consume(i, '`');
          if (j - i === l) {
            backs.pop();
          }
          i = j;
        } else {
          j = _.consume(i, '`');
          backs.push([i, j - i]);
          i = j;
        }
        break;
      case '}':
        if (attrs.length && !backs.length && !qdoub.length && !qsing.length) {
          j = attrs.pop();
          if (j < i) {
            _.write(j + 1, '', i);
            attributes(_.derive(_.sub(j + 1, i)));
          }
        }
        ++i;
        break;
      default:
        ++i;
    }
    c = input[i];
  }
  _.write(i);
}

function link(text) {
  const match = text.match(/(.*)(\s(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'))/);
  const link = match ? match[1] : text;
  return encodeURI(link.trim()) + (match ? match[2] : '');
}

function attributes(_) {
  const { input, n } = _;
  let i = 0, j;
  let c;
  let dq, sq, bq, bn;

  while (i < n) {
    c = input[i];
    switch (c) {
      case '\\':
        i += 2;
        break;
      case '.':
      case '#':
        // consume class or id definitions
        i = _.ws(_.notspace(i + 1) + 1);
        break;
      case '=':
        if (!dq && !sq && !bq) {
          i = _.space(i + 1);
          if ((j = _.consume(i, '`')) > i) {
            // backtick quoted attribute
            bq = i;
            bn = j - i;
            i = j;
          } else if (_.peek(i, '"')) {
            // double quoted attribute
            dq = ++i;
          } else if (_.peek(i, '\'')) {
            // single quoted attribute
            sq = ++i;
          } else {
            // consume until space
            i = _.notspace(i + 1);
          }
        } else {
          ++i;
        }
        break;
      case '`':
        if (bq) {
          j = _.consume(i, '`');
          if (bn <= j - i) {
            j = i + bn;
            _.write(bq, `"${_.sub(bq, j).replaceAll('"', '\\"')}"`, j);
            bq = 0;
          }
          i = j;
        } else {
          ++i;
        }
        break;
      case '"':
        if (dq) dq = false;
        ++i;
        break;
      case '\'':
        if (sq) sq = false;
        ++i;
        break;
      default:
        ++i;
    }
  }
  _.write(i);
}
