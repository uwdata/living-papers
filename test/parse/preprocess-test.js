import assert from 'node:assert';
import { process } from '../../src/parse/preprocess.js';

function test(input, expected) {
  const buf = [];
  process(input, s => buf.push(s));
  assert.equal(buf.join(''), expected);
}

describe('preprocess', () => {
  it('handles fenced blocks', () => {
    test('```foo {.bar}', '```{.foo .bar}');
    test('~~~foo {.bar}', '~~~{.foo .bar}');
    test(':::foo {.bar}', ':::{.foo .bar}');

    test('``` foo {.bar}', '``` {.foo .bar}');
    test('~~~ foo {.bar}', '~~~ {.foo .bar}');
    test('::: foo {.bar}', '::: {.foo .bar}');

    test('\n``` foo {.bar}', '\n``` {.foo .bar}');
    test('\n~~~ foo {.bar}', '\n~~~ {.foo .bar}');
    test('\n::: foo {.bar}', '\n::: {.foo .bar}');

    test('\n ``` foo {.bar}', '\n ``` {.foo .bar}');
    test('\n ~~~ foo {.bar}', '\n ~~~ {.foo .bar}');
    test('\n ::: foo {.bar}', '\n ::: {.foo .bar}');

    test('```` foo {.bar}', '```` {.foo .bar}');
    test('~~~~ foo {.bar}', '~~~~ {.foo .bar}');
    test(':::: foo {.bar}', ':::: {.foo .bar}');

    test('````` foo {.bar} ```', '````` {.foo .bar} ```');
    test('~~~~~ foo {.bar} ~~~', '~~~~~ {.foo .bar} ~~~');
    test('::::: foo {.bar} :::', '::::: {.foo .bar} :::');

    test('```foo {.bar}\ncode\n```', '```{.foo .bar}\ncode\n```');

    test(
      '[:time-plot:]{\n theta=`focus`\n oninput=`theta = event.target.value`\n}',
      '[:time-plot:]{\n theta="`focus`"\n oninput="`theta = event.target.value`"\n}'
    );
  });

  it('handles pipes', () => {
    test(':::\nfoo\n| bar', ':::\nfoo\n\n| bar');
    test(':::\nfoo\n| bar\n| baz', ':::\nfoo\n\n| bar\n| baz');
    test(':::\nfoo\n|  bar', ':::\nfoo\n\n|  bar');
    test(':::\nfoo\n|  bar\n|  baz', ':::\nfoo\n\n|  bar\n|  baz');
  });

  it('handles links', () => {
    test('[link](`foo = 1`)', '[link](%60foo%20=%201%60)');
    test('[link](`foo = 1` "title")', '[link](%60foo%20=%201%60 "title")');
    test('[link](`foo = 1` \'title\')', '[link](%60foo%20=%201%60 \'title\')');

    test('[link](`foo = fn()`)', '[link](%60foo%20=%20fn()%60)');

    test('[link](``foo = 1``)', '[link](%60%60foo%20=%201%60%60)');
    test('[link](```foo = 1```)', '[link](%60%60%60foo%20=%201%60%60%60)');
  });

  it('handles fence attributes', () => {
    test('~~~ {.foo}', '~~~ {.foo}');
    test(
      '~~~ {#id .cls foo=`a = \'3\'`}',
      '~~~ {#id .cls foo="`a = \'3\'`"}'
    );
    test('~~~ {#id .cls foo = 3}', '~~~ {#id .cls foo=3}');
    test('~~~ {#id .cls foo= 3}',  '~~~ {#id .cls foo=3}');
    test('~~~ {#id .cls foo =3}',  '~~~ {#id .cls foo=3}');
  });

  it('handles span attributes', () => {
    test('[span]{.foo}', '[span]{.foo}');
    test('[span](link){.foo}', '[span](link){.foo}');
    test('[span]{#id}', '[span]{#id}');
    test('[span](link){#id}', '[span](link){#id}');
    test('[span]{foo=bar baz=bop}', '[span]{foo=bar baz=bop}');
    test(
      '[span]{foo=\'"{[`bar`]}"\' baz="\'{[bop]}\'"}',
      '[span]{foo=\'"{[`bar`]}"\' baz="\'{[bop]}\'"}'
    );
    test(
      '[span]{foo=`a = "1"` baz=`alert({2})}`}',
      '[span]{foo="`a = \\"1\\"`" baz="`alert({2})}`"}',
    );
  });
});
