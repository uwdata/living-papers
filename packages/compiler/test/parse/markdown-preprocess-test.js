import assert from 'node:assert';
import { process } from '../../src/parse/markdown/preprocess.js';

function test(input, expected) {
  const buf = [];
  process(input, s => buf.push(s));
  assert.equal(buf.join(''), expected);
}

describe('preprocess', () => {
  it('handles fenced blocks with component name', () => {
    test('```foo', '```{component=foo}');
    test('~~~foo', '~~~{component=foo}');
    test(':::foo', ':::{component=foo}');

    test('```foo {.bar}', '```{component=foo .bar}');
    test('~~~foo {.bar}', '~~~{component=foo .bar}');
    test(':::foo {.bar}', ':::{component=foo .bar}');

    test('``` foo {.bar}', '``` {component=foo .bar}');
    test('~~~ foo {.bar}', '~~~ {component=foo .bar}');
    test('::: foo {.bar}', '::: {component=foo .bar}');

    test('\n``` foo {.bar}', '\n``` {component=foo .bar}');
    test('\n~~~ foo {.bar}', '\n~~~ {component=foo .bar}');
    test('\n::: foo {.bar}', '\n::: {component=foo .bar}');

    test('\n ``` foo {.bar}', '\n ``` {component=foo .bar}');
    test('\n ~~~ foo {.bar}', '\n ~~~ {component=foo .bar}');
    test('\n ::: foo {.bar}', '\n ::: {component=foo .bar}');

    test('```` foo {.bar}', '```` {component=foo .bar}');
    test('~~~~ foo {.bar}', '~~~~ {component=foo .bar}');
    test(':::: foo {.bar}', ':::: {component=foo .bar}');

    test('````` foo {.bar} ```', '````` {component=foo .bar} ```');
    test('~~~~~ foo {.bar} ~~~', '~~~~~ {component=foo .bar} ~~~');
    test('::::: foo {.bar} :::', '::::: {component=foo .bar} :::');

    test('```foo {.bar}\ncode\n```', '```{component=foo .bar}\ncode\n```');

    // handles dash in component/class names
    test('```foo-bar {.bar-baz}', '```{component=foo-bar .bar-baz}');
    test('~~~foo-bar {.bar-baz}', '~~~{component=foo-bar .bar-baz}');
    test(':::foo-bar {.bar-baz}', ':::{component=foo-bar .bar-baz}');

    // handles colon in component/class names
    test('```foo:bar {.bar-baz}', '```{component=foo:bar .bar-baz}');
    test('~~~foo:bar {.bar-baz}', '~~~{component=foo:bar .bar-baz}');
    test(':::foo:bar {.bar-baz}', ':::{component=foo:bar .bar-baz}');
  });

  it('handles fenced blocks with class name', () => {
    test('```.foo', '```{.foo}');
    test('~~~.foo', '~~~{.foo}');
    test(':::.foo', ':::{.foo}');

    test('``` .foo {.bar}', '``` {.foo .bar}');
    test('~~~ .foo {.bar}', '~~~ {.foo .bar}');
    test('::: .foo {.bar}', '::: {.foo .bar}');
  });

  it('handles fenced blocks with id name', () => {
    test('```#foo', '```{#foo}');
    test('~~~#foo', '~~~{#foo}');
    test(':::#foo', ':::{#foo}');

    test('``` #foo {.bar}', '``` {#foo .bar}');
    test('~~~ #foo {.bar}', '~~~ {#foo .bar}');
    test('::: #foo {.bar}', '::: {#foo .bar}');
  });

  it('handles nested fenced blocks', () => {
    test(
      '::: foo\n::: bar\n:::\n:::\n',
      '::: {component=foo}\n::: {component=bar}\n:::\n:::\n'
    );
    test(
      '::: foo {.fob}\n::: bar {.bob}\n:::\n:::\n',
      '::: {component=foo .fob}\n::: {component=bar .bob}\n:::\n:::\n'
    );
    test(
      ':::: figure {#id}\n::: subfigure {latex:width=80%}\n:::\n::::\n',
      ':::: {component=figure #id}\n::: {component=subfigure latex:width=80%}\n:::\n::::\n'
    );
  });

  it('handles fenced blocks with comments', () => {
    // don't get fooled by comments
    test(
      '::: foo\n<!--\n:::\n::: baz\n-->\n:::',
      '::: {component=foo}\n<!--\n:::\n::: baz\n-->\n:::'
    );
    test(
      '::: foo {.bar}\n<!--\n:::\n::: baz {.bop}\n-->\n:::',
      '::: {component=foo .bar}\n<!--\n:::\n::: baz {.bop}\n-->\n:::'
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
    test(
      '[:time-plot:]{\n theta=`focus`\n oninput=`theta = event.target.value`\n}',
      '[:time-plot:]{\n theta="`focus`"\n oninput="`theta = event.target.value`"\n}'
    );
  });
});
