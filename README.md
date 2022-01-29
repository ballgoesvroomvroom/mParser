# mParser
A top-down, LL(0), Markdown parser created in Javascript.<br />
Displays the output in a fanciful html page served along a static `.css` file.<br /><br />
Doesn't use conventional tags on the outermost layers such as `<h1>`, `<p>`, etc..<br />But instead uses `<div>` tags along with class attributes, styling it in said `.css` file.

## Caveats
The parser was built for personal use only hence I did not feel the need to invest the time and effort into handling and capturing "edge cases".<br />
Being a LL(0) parser (or maybe a lack of experience), I had issues implementing a few cases within [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/), however I tried my best to model the parser with GFM's spec.<br />
  - No support for multi-line token/tag capturing
    - Parses the document line by line without any backtracking or lookahead on external lines（\*゜ー゜\*）
    - Backtracking and lookahead is present with capturing tokens within focused line with regular expression.
  - Elements within headers are not parsed.
    - Spec reference [🢡](https://github.github.com/gfm/#example-36)
  - Headers would not parse closing sequence of `#`.
    - Spec reference [🢡](https://github.github.com/gfm/#example-41)

## Future implementations
- Support for LaTeX's math equations and displaying using 3rd party rendering engines.
- Footer section for citation references and links.
- Customisable themes.