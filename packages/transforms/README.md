# Living Papers: Transforms

Library of external transforms for Living Papers ASTs.

## Transform Registration

To be used by Living Papers, a transform implmentation must also be registered with Living Papers at compile time.
Transform information is provided in a `package.json` file, typically found in the root directory of a package.

### Registration Format

Here is an example registration for a single transform (omitting other `package.json` entries):

```json
{
  "living-papers": {
    "transforms": [
      {
        "name": "knits",
        "file": "src/knitr/index.js"
      }
    ]
  }
}
```

A registration object supports two properties:

- `name`: (_required_) The name of the custom transform. To apply the transform, this name should be included in a Living Papers article metadata block, under the `transforms:` key.
- `file`: (_required_) The source file containing the transform definition, relative to the `package.json` file. The transform is assumed to be the default export of the file.

### Transform Resolution

The compiler attempts to resolve transforms in the following _increasing_ precedence order.
Later entries can override earlier ones.

1. The included components from this package (`@living-papers/transforms`).
2. Any custom transforms registered in `{inputDir}/package.json`.

If a component entry starts with `./`, `../`, or `/`, it is treated as a path relative to the input directory.
Otherwise, the component entry is treated as an npm package name.
External packages must also be included as `dependencies` in a projects `package.json` file.
