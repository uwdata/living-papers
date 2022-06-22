---
title: ACM Template
author:
  - name: Ben Trovato and G.K.M. Tobin
    org: Institute for Clarity in Documentation, USA
  - name: Lars Thørväld
    org: The Thørväld Group, Iceland
  - name: Valerie Béranger
    org: Inria Paris-Rocquencourt, France
  - name: Aparna Patel
    org: Rajiv Gandhi University, India
  - name: Huifen Chan
    org: Tsinghua University, China
  - name: Charles Palmer
    org: Palmer Research Laboratories, USA
  - name: John Smith
    org: The Thørväld Group, Iceland
  - name: Julius P. Kumquat
    org: The Kumquat Consortium, USA
bibliography: references.bib
output:
  html:
    theme: acm
version: 1.0
---

::: figure
![Idyll teaser image](https://idl.cs.washington.edu/static/images/figures/idyll.png)
| Seattle Mariners at Spring Training, 2010.
:::

A clear and well-documented $\LaTeX$ document is presented as an article formatted for publication by ACM in a conference proceedings or journal publication. Based on the "`acmart`" document class, this article presents and explains many of the common variations, as well as many of the formatting elements an author may use in the preparation of the documentation of their work.

<!-- CCS Concepts: • Computer systems organization → Embedded systems; Redundancy; Robotics; • Networks → Network reliability.

Additional Key Words and Phrases: datasets, neural networks, gaze detection, text tagging -->

**ACM Reference Format:**

Ben Trovato, G.K.M. Tobin, Lars Thørväld, Valerie Béranger, Aparna Patel, Huifen Chan, Charles Palmer, John Smith, and Julius
P. Kumquat. 2018. The Name of the Title is Hope. In *Woodstock ’18: ACM Symposium on Neural Gaze Detection, June 03–05, 2018,
Woodstock, NY*. ACM, New York, NY, USA, 11 pages. https://doi.org/XXXXXXX.XXXXXXX

# Introduction

ACM’s consolidated article template, introduced in 2017, provides a consistent $\LaTeX$ style for use across ACM publications, and incorporates accessibility and metadata-extraction functionality necessary for future Digital Library endeavors. Numerous ACM and SIG-specific $\LaTeX$ templates have been examined, and their unique features incorporated into this single new template.

If you are new to publishing with ACM, this document is a valuable guide to the process of preparing your work for publication. If you have published with ACM before, this document provides insight and instruction into more recent changes to the article template.

The "`acmart`" document class can be used to prepare articles for any ACM publication — conference or journal, and for any stage of publication, from review to final "camera-ready" copy, to the author’s own version, with very few changes to the source.

# Template Overview

As noted in the introduction, the "`acmart`" document class can be used to prepare many different kinds of documentation --- a double-blind initial submission of a full-length technical paper, a two-page SIGGRAPH Emerging Technologies abstract, a "camera-ready" journal article, a SIGCHI Extended Abstract, and more --- all by selecting the appropriate *template style* and *template parameters*.

This document will explain the major features of the document class. For further information, the *$\LaTeX$ User's Guide* is available from [https://www.acm.org/publications/proceedings-template](https://www.acm.org/publications/proceedings-template). ^[The "justified text" on this line looks strange because the link is so large.]

## Template Styles

The primary parameter given to the "`acmart`" document class is the *template style* which corresponds to the kind of publication or SIG publishing the work. This parameter is enclosed in square brackets and is a part of the `documentclass` command:

```
\documentclass[STYLE]{acmart}
```

Journals use one of three template styles. All but three ACM journals
use the `acmsmall` template style:

- `acmsmall`: The default journal template style.
- `acmlarge`: Used by JOCCH and TAP.
- `acmtog`: Used by TOG.

The majority of conference proceedings documentation will use the `acmconf` template style.

- `acmconf`: The default proceedings template style.
- `sigchi`: Used for SIGCHI conference articles.
- `sigchi-a`: Used for SIGCHI "Extended Abstract" articles.
- `sigplan`: Used for SIGPLAN conference articles.

## Template Parameters

In addition to specifying the *template style* to be used in formatting your work, there are a number of *template parameters* which modify some part of the applied template style. A complete list of these parameters can be found in the *$\LaTeX$ User's Guide*.

Frequently-used parameters, or combinations of parameters, include:

- `anonymous,review`: Suitable for a "double-blind" conference submission. Anonymizes the work and includes line numbers. Use with the `acmSubmissionID` command to print the submission's unique ID on each page of the work.
- `authorversion`: Produces a version of the work suitable for posting by the author.
- `screen`: Produces colored hyperlinks.

This document uses the following string as the first command in the
source file:

```
\documentclass[sigconf,authordraft]{acmart}
```

# Modifications

Modifying the template --- including but not limited to: adjusting margins, typeface sizes, line spacing, paragraph and list definitions, and the use of the `vspace` command to manually adjust the vertical spacing between elements of your work --- is not allowed.

**Your document will be returned to you for revision if modifications are discovered.**

::: figure
For any Living Papers theme, you can override the default column sizes and margins simply by setting CSS variables in `style.scss`:

```scss {style="font-style:normal"}
:root {
  // maximum width of the main article column
  --max-article-width: 100ex;
  // padding between the edge of the screen and the main column
  --article-padding: 32px;
  // width of the column containing margin notes
  --margin-width: 400px;
  // space between the main article column and the margin
  --gap-width: 100px;
}
```

On smaller screens, this `pre` block has a horizontal scrollbar instead of line-wrapping.
:::


# Typefaces

The "`acmart`" document class requires the use of the "Libertine" typeface family. Your $\TeX$ installation should include this set of packages.^[The font assets for the Living Papers's ACM theme were taken from Will Crichton's [nota-theme-acm](https://github.com/nota-lang/nota/tree/master/packages/nota-theme-acm/css/assets).] Please do not substitute other typefaces. The "`lmodern`" and "`ltimes`" packages should not be used, as they will override the built-in typeface families.

# Title Information

The title of your work should use capital letters appropriately - [https://capitalizemytitle.com/](https://capitalizemytitle.com) has useful rules for capitalization. Use the `title` command to define the title of your work. If your work has a subtitle, define it with the `subtitle` command.  Do not insert line breaks in your title.

If your title is lengthy, you must define a short version to be used in the page headers, to prevent overlapping text. The `title` command has a "short title" parameter:

```
\title[short title]{full title}
```

# Authors and Affiliations

Each author must be defined separately for accurate metadata identification. Multiple authors may share one affiliation. Authors' names should not be abbreviated; use full first names wherever possible. Include authors' e-mail addresses whenever possible ^[TODO: support email addresses].

Grouping authors’ names or e-mail addresses, or providing an "e-mail alias," as shown below, is not acceptable:

```
\author{Brooke Aster, David Mehldau}
\email{dave,judy,steve@university.edu}
\email{firstname.lastname@phillips.org}
```

The `authornote` and `authornotemark` commands allow a note to apply to multiple authors --- for example, if the first two authors of an article contributed equally to the work.

If your author list is lengthy, you must define a shortened version of the list of authors to be used in the page headers, to prevent overlapping text. The following command should be placed just after the last `\author{}` definition:

```
\renewcommand{\shortauthors}{McCartney, et al.}
```

Omitting this command will force the use of a concatenated list of all of the authors' names, which may result in overlapping text in the page headers.

The article template's documentation, available at [https://www.acm.org/publications/proceedings-template](https://www.acm.org/publications/proceedings-template), has a complete explanation of these commands and tips for their effective use.

Note that authors' addresses are mandatory for journal articles.

# Rights Information

Authors of any work published by ACM will need to complete a rights form. Depending on the kind of work, and the rights management choice made by the author, this may be copyright transfer, permission, license, or an OA (open access) agreement.

Regardless of the rights management choice, the author will receive a copy of the completed rights form once it has been submitted. This form contains $\LaTeX$ commands that must be copied into the source document. When the document source is compiled, these commands and their parameters add formatted text to several areas of the final document:

- the "ACM Reference Format" text on the first page.
- the "rights management" text on the first page.
- the conference information in the page header(s).

Rights information is unique to the work; if you are preparing several works for an event, make sure to use the correct set of commands with each of the works.

The ACM Reference Format text is required for all articles over one page in length, and is optional for one-page articles (abstracts).

# CCS Concepts and User-Defined Keywords

Two elements of the "acmart" document class provide powerful taxonomic tools for you to help readers find your work in an online search.

The ACM Computing Classification System --- [https://www.acm.org/publications/class-2012](https://www.acm.org/publications/class-2012) --- is a set of classifiers and concepts that describe the computing discipline. Authors can select entries from this classification system, via [https://dl.acm.org/ccs/ccs.cfm](https://dl.acm.org/ccs/ccs.cfm), and generate the commands to be included in the $\LaTeX$ source.

User-defined keywords are a comma-separated list of words and phrases of the authors' choosing, providing a more flexible way of describing the research being presented.

CCS concepts and user-defined keywords are required for for all articles over two pages in length, and are optional for one- and two-page articles (or abstracts).

# Sectioning Commands

Your work should use standard $\LaTeX$ sectioning commands: `section`, `subsection`, `subsubsection`, and `paragraph`. They should be numbered; do not remove the numbering from the commands. ^[Your work should use standard Markdown sectioning commands:
`# Top level header`, `## Second level`, `### Third level`. They should *not* be numbered.]

Simulating a sectioning command by setting the first word or words of a paragraph in boldface or italicized text is **not allowed.**

# Tables

The "`acmart`" document class includes the "`booktabs`" package --- [https://ctan.org/pkg/booktabs](https://ctan.org/pkg/booktabs) --- for preparing high-quality tables.

Table captions are placed *above* the table.

Because tables cannot be split across pages, the best placement for them is typically the top of the page nearest their initial cite. [^1] To ensure this proper "floating" placement of tables, use the environment **table** to enclose the table's contents and the table caption.  The contents of the table itself must go in the **tabular** environment, to be aligned properly in rows and columns, with the desired horizontal and vertical rules.  Again, detailed instructions on **tabular** material are found in the *$\LaTeX$ User's Guide*.

Immediately following this sentence is the point at which @fig:freq is included in the input file; compare the placement of the table here with the table in the printed output of this document.

::: figure {#freq}
| Frequency of Special Characters

| Non-English or Math | Frequency   | Comments          |
|:-------------------:|:-----------:|:------------------|
| $\O$                | 1 in 1,000  | For Swedish names |
| $\pi$               | 1 in 5      | Common in math    |
| $                   | 4 in 5      | Used in business  |
| $\Psi^2_1$          | 1 in 40,000 | Unexplained usage |
:::

To set a wider table [^2], which takes up the whole width of the page's live area, use the environment **table\*** to enclose the table's contents and the table caption.  As with a single-column table, this wide table will "float" to a location deemed more desirable. Immediately following this sentence is the point at which @fig:commands is included in the input file; again, it is instructive to compare the placement of the table here with the table in the printed output of this document.

[^1]: In the HTML output format, tables should be placed where they are most logically relevant.
[^2]: In this ACM theme, tables take up the whole main column width by default.

::: figure {#commands}
| Some Typical Commands

| Command   | A Number | Comments         |
|:---------:|:--------:|:-----------------|
| `\author` |      100 | Author           |
| `\table`  |      300 | For tables       |
| `\table`  |      400 | For wider tables |
:::

Always use midrule to separate table header rows from data rows, and use it only for this purpose. This enables assistive technologies to recognise table headers and support their users in navigating tables more easily. ^[Living Papers tables are even better for screenreaders and accessibility!]