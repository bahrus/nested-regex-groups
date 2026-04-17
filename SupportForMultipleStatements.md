# Support for Multiple Statements

One primary goal of this package is to support a paragraph of repetitive text, where each sentence, separated by a period, gets parsed to a (nested) object based on the nested-regex-groups support.

So in addition to supporting:

```JavaScript
const result = beSwitchedParser('on when #lhs::change?.weight gt #rhs?.weight. Off when #brother::change?.height lt #sister::input?.height');
```

Periods at the end of the last sentence should be optional (so if there's only one sentence, no need for a period at the end.)

We should ignore periods that are preceded either by a question mark, as shown above, or by a \ escape symbol.

In addition, because the nested-regex-groups requires a significant payload to support, which may be overkill in some cases, we should also support simpler paragraphs that only need to specify flat object structures using the built-in named capture groups.

So I'm thinking to support this, we should have:

- parseStatements -- separates a paragraph into an array of strings, based on the period delimiter (with the exceptions mentioned above for ? and \).  If no period is present, it still generates an array for uniformity of the result.
- parsedGroupedCaptures -- we pass in patterns just like parsePatterns, but no periods are allowed in the named groups. We could just let the error get thrown when turning it into a regular expression, where periods aren't allowed.
- parseGroupedCaptureStatements -- we continue to pass in the config.patterns without nested support, but it first divides a paragraph into an array of strings, and then parses each one, producing an array of flat objects.
- parsePatterns -- already done previously.
- parsePatternedStatements -- we continue to pass in the config.patterns, but now with nested support, and again it first divides a paragraph into an array of strings, and then parses each one, producing an array of nested objects.
