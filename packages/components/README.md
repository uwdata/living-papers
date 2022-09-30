# Living Papers: Components

Library of built-in [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) for use in HTML documents produced by the Living Papers framework.

## Web Component Registration

To be used by Living Papers, a component implmentation must also be registered with Living Papers at compile time.
Component information is provided in a `package.json` file, typically found in the root directory of a package.

### Registration Format

Here is an example registration for a single component (omitting other `package.json` entries):

```json
{
  "living-papers": {
    "components": [
      {
        "name": "tex-math",
        "import": "TexMath",
        "file": "src/tex-math.js",
        "css": "css/tex-math.css"
      }
    ]
  }
}
```

A registration object supports four properties:

- `name`: (_required_) The name of the custom element in output HTML. The name must follow [custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/) rules, for example it **must* include two words separated by a dash character.
- `file`: (_required_) The source file containing the component definition, relative to the `package.json` file.
- `import`: (_optional_) The element class definition to import from the source file. If unspecified, a camel-case version of the `name` will be used. For example the element name `tex-math` will be mapped to the class name `TexMath`.
- `css`: (_optional_) A file of CSS declarations that should be included, as needed. Different components may use the same backing CSS file; the compiler will automatically de-duplicate redundant files.

### Component Resolution

The compiler attempts to resolve components in the following _increasing_ precedence order.
Later entries can override earlier ones.

1. The built-in components from this package (`@living-papers/components`).
2. Any custom components registered in `{inputDir}/package.json`.
3. Any custom components registered in `{inputDir}/components/package.json`.
4. Any files or packages listed in article metadata under the `components` attribute.

Articles may include component metadata like so:

```yaml
---
components:
  - my-npm-package-name
  - ./relative-path-to-dir/components/
---
```

If a component entry starts with `./`, `../`, or `/`, it is treated as a path relative to the input directory.
Otherwise, the component entry is treated as an npm package name.
External packages must also be included as `dependencies` in a projects `package.json` file.

## Web Component Conventions

Living Papers can be extended with arbitrary [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). That said, Living Papers components tend to follow a few conventions:

- Components should support reactive updates, revising internal state and output in response to both `setAttribute` calls and assignments to component properties.
- Components that function as dynamic inputs should follow a shared protocol: The component should include a `value` property that exposes (gets/sets) the current value of the component and should fire `input` events upon state changes triggered by direct user input. Following this protocol ensures that the component can participate in multi-way variable binding.
- Built-in components do **not** use the [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM). This ensures that global CSS and text selections work in the way that most web developers and users are accustomed to. External component implementions are free to make their own decisions, but may want to take this into account.
- Built-in components remove their child nodes (if any) from the DOM upon connection. These nodes are stored under a `__children` property that rendering logic can later access as needed. For example, this allows a syntax higlighting or TeX math component to extract a text node child (e.g., representing source code or math markup) and process it further.

Interally, we use the [Lit](https://lit.dev/) framework to implement components. While not required for external component implementations, we find we benefit greatly from Lit's templating and reactive lifecycle support. Custom external components may subclass from the Lit-based abstract base classes exported by this package:

- `ArticleElement` - A `LitElement` that detaches and stores child nodes as described above.
- `DependentElement` - An `ArticleElemnent` that can dynamically load external dependencies.

See the source code for more, including example uses.
