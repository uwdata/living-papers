% `vgtc' LaTeX class. 
% THIS FILE MAY NOT BE MODIFIED WITHOUT THE EXPRESS APPROVAL
% OF THE VGTC PUBLICATIONS CHAIR (submissions@vgtc.org).
%
% Changelog:
% - modifications by Cody Dunne 2023/01/04
%   - author-facing changes and documentation
%     - added Supplemental Materials and Figure Credits sections at the end.
%     - added supplemental materials instructions and goals, an example project 
%       on OSF, and an OSF link in abstract.
%     - replaced paper count figure with newly-made ones and the source files 
%       and instructions for creating them. This goes along with the supplemental 
%       material examples.
%     - added \authororcid command and instructions for adding hyperlinked ORCID ID 
%       icons for each author.
%     - moved figures to /fig folder.
%     - expanded discussion of figures, esp. vector graphics.
%     - added figure credits for CypressView after digital archaeology to track it down.
%     - added an example appendix and consolidated troubleshooting advice there.
%     - added \iflabelexists to cross-reference appendices if they exist
%     - added hideappendix option to remove appendices for submission / camera ready
%     - changed to hyperlink DOIs by default, but removed URL hyperlinking
%       of references. Additionally, only hyperlinks on the DOIs themselves.
%     - more emphasis on asking for DOIs by default.
%     - added cleveref package and instructions for use, rather than using autoref.
%     - changed cross references to point to the top of the target float, rather than the caption.
%     - added blue hyperlink coloring, now that electronic has long been the default.
%     - added subcaption package and instructions for using it for subfigures and referencing them.
%     - lists are now more compact.
%     - widereview option now works without errors.
%     - simplified the example .tex file
%       - simplified instructions for which class options to use.
%       - applied automatic then manual formatting to .cls file to increase readability.
%       - moved \ifpdf decisions to .cls file.
%       - moved loading standard classes, where possible, to .cls file.
%       - no longer need to call \vgtcinsertpkg in the .tex file.
%       - replaced lorem ipsum text with content and calls to \lipsum from the lipsum package.
%     - removed sample.pdf & sample.eps.
%     - removed Google Scholar fields from template.bib.
%     - updated Readme.md and added Overleaf links. **NOTE: I did not test readme.md 
%       makefile instructions.**
%   - non-author-facing changes
%     - eliminated redundant hyperref code (which removed the need for \vgtcinsertpkg 
%       in the .tex file).
%     - consolidated errors for using old commands like \vgtcinsertpkg.
%     - eliminated the unused electronic, cameraready, and tvcgsize options
%       (which has been the default) but kept the code.
%     - the widereview option fix motivated the class-wide change to using etoolbox
%       toggles rather than plain LaTeX if statements to avoid unexpected problems: 
%       https://tex.stackexchange.com/a/5896. 
%     - applied automatic then manual formatting to .cls file to increase readability,
%       esp. for nested if statements.
%     - removed commented code that seemed to no longer serve a purpose.
%     - added comments with my name for potential future code to remove.
%     - tested all changes with the options in the template.tex file using both pdflatex 
%       and dvips from MikTeX on Windows 11.
% - modifications by Cagatay Turkay and Soumya Dutta on 2019/09/11
%   - modified the preprint article style to contain the IEEE copyright notices to produce IEEE-compliant OA preprints.
%   - included two different statements for journal and conference papers
%   - added a new command \ieeedoi for authors to set IEEE generated DOIs on their preprints
%   - added comments on the template.tex for preprint guidance
% - modifications by Tobias Isenberg on 2017/07/05
%   - updated the instructions for author footer in template.tex for the journal template
% - modifications by Tobias Isenberg on 2017/06/14
%   - improved handling of marginpars for conference style, added examples for both styles
% - modifications by Tobias Isenberg on 2017/06/13
%   - updated link to ACM CCS in conference template tex
%   - transitioned to the updated 2012 system to be used with \CCScatTwelve (1998 still possible)
%   - updated CCS examples in conference template tex
%   - added statement in journal template tex to leave the copyright block untouched
%   - updated the DOI links in the bst files to use shorter https version
% - modifications by Filip Sadlo/Tobias Isenberg on 2017/03/16
%   - revived latex mode (as opposed to pdflatex) by disabling \let\ifpdf\relax
%   - note that packages that define \ifpdf (and thus lead to already defined
%     \ifpdf) are obsolete and should be changed to use ifpdf package instead
%   - added a comment to the actual tex template for those with compilation errors
% - modifications by Tobias Isenberg on 2016/07/19
%   - fixed a bug in the hyperref data (missing comma, thanks to Christian
%     Tominski)
%   - adjusted behavior for when \vgtccategory{} is not set in review mode (print
%     out "n/a")
%   - added switch to print out paper type in review mode if desired in review
%     mode, does not print anything if not used
%   - added teaser width computation, limited the entire teaser to the width of
%     the abstract
%   - fixes to the bibTeX templates for how addresses in proceedings are used,
%     now similar to inproceeding
%   - fixes to the bibTeX templates for dois with more than one dash in them
%   - fixes to the bibTeX templates: dois are now linked with https if only the
%     pure doi was given
%   - fixed caption behavior for tables due to caption expected above the table
% - modifications by Filip Sadlo on 2016/03/16
%   - replaced \pdfoutput mechanism by \ifpdf because \pdfoutput was
%     always detecting pdf output mode on current texlive installations
%   - The modification follows the current version of egpubl.cls
% - modifications by Tobias Isenberg on 2016/03/24
%   - improved marginpar
% - modifications by Tobias Isenberg on 2015/03/24
%   - better compilation for pdfLaTeX
%   - electronic option is now mandatory
%   - hyperref settings redone, information automatically used for pdf information
%   - microtype
%   - some suggestions for style use
%   - alternative bst files with DOI printing and hyperlinking
% - modifications by Meghan Haley on 2011/03/10
%   - manuscript received dates changed for 2011 journal style
% - modifications by Steven Bergner on 2009/03/28
%   - revived teaser feature
%   - added captionmargin to align teaser caption with abstract width
% - modifications by Meghan Haley on 2006/07/20
%   - manuscript received changed to 31 March for journal style
% - modifications by Steven Bergner on 2006/06/28
%   - made review and preprint work for journal style
%   - leveraged \firstsection{..} title above double column text
%   - included diamond line (currently by loading .eps file)
%   - adjusted headlines and footer (special on first page, with copyrighttext)
% - modifications by Steven Bergner on 2006/05/21
%   - included 'electronic' option using method from egpubl.cls (c)by D.Fellner
%   - included double column (full width) abstract/keywords/index terms,
%     which can be toggled by (ex/in)clusion of 'journal' document option
%     note: abstract is now a command not an environment, see template.tex
%   - copyrightspace enabled by default with opt. \nocopyrightspace switch
%   - 'CR categories' now called 'Index Terms'
%   - adjusted {sub|subsub|}section headline spacing
%   - adjusted to vgtc naming (from tcvg or acm)
% - modification of the acmsiggraph.cls class
% - modifications on 2004/04/06 by Torsten Moeller
%    * many modifications to conform to VGTC standard
%      - new heading style
%      - new caption style
%      - new reference style
%      - copyrightspace reduced to 0.5in
% - borrows *heavily* from Daniel Kartch's 'siggraph' class. 
% - also uses pieces of 'apalike.sty' and 'authordate1-4.cls'
% - version 0.1 2001/06/01 Stephen Spencer (spencer@acm.org)
% - version 0.2 2001/10/15 Stephen Spencer
%   - the "\onlineid" variable works with the "review" mode, placing a
%     banner across the top of each page "Online Submission ID 'onlineid'
% - version 0.3 2002/01/11 Stephen Spencer
%   - disabled the cover page option.
% - version 0.4 2002/01/23 Stephen Spencer
%   - based on suggestions from James O'Brien, the following changes:
%     - correction if '\ifcamera' and '\ifcameraelse' commands
%     - page numbering in both review and preprint modes
%     have been made.

% ------------ identification --------------
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{vgtc}[2023/01/04 IEEE VGTC]

% ------------ initial code --------------

\RequirePackage{etoolbox}

\newtoggle{vgtc@submitorcamera}      \toggletrue{vgtc@submitorcamera}%
\newtoggle{vgtc@preprint}            \togglefalse{vgtc@preprint}
\newtoggle{vgtc@review}              \togglefalse{vgtc@review}
\newtoggle{vgtc@doublespaced}        \togglefalse{vgtc@doublespaced}
\newtoggle{vgtc@wide}                \togglefalse{vgtc@wide}
\newtoggle{vgtc@havecopyrightspace}  \toggletrue{vgtc@havecopyrightspace}
\newtoggle{vgtc@journal}             \togglefalse{vgtc@journal}
\newtoggle{vgtc@hideappendix}        \togglefalse{vgtc@hideappendix}

\newcommand{\vgtc@columnmode}{twocolumn}
\newcommand{\vgtc@pointsize}{9pt}

\RequirePackage{ifpdf}%

%% These few lines make a distinction between latex and pdflatex calls and they
%% bring in essential packages for graphics and font handling.
\ifpdf%                                % if we use pdflatex
  \pdfoutput=1\relax                   % create PDFs from pdfLaTeX
  \pdfcompresslevel=9                  % PDF Compression
  \pdfoptionpdfminorversion=7          % create PDF 1.7
  \ExecuteOptions{pdftex}
  \RequirePackage{graphicx}                % allow us to embed graphics files
  \DeclareGraphicsExtensions{.pdf,.png,.jpg,.jpeg} % for pdflatex we expect .pdf, .png, or .jpg files
\else%                                 % else we use pure latex
  \ExecuteOptions{dvips}
  \RequirePackage{graphicx}                % allow us to embed graphics files
  \DeclareGraphicsExtensions{.eps}     % for pure latex we expect eps files
\fi%

% ------------ declaration of options --------------

% 'review' option.
\DeclareOption{review}{%
  \togglefalse{vgtc@preprint}%
  \toggletrue{vgtc@review}%
  \togglefalse{vgtc@havecopyrightspace}%
}

% 'widereview' option.
\DeclareOption{widereview}{%
  \togglefalse{vgtc@preprint}%
  \toggletrue{vgtc@review}%
  \renewcommand{\vgtc@columnmode}{onecolumn}%
  \toggletrue{vgtc@wide}%
  \toggletrue{vgtc@doublespaced}%
  \renewcommand{\vgtc@pointsize}{12pt}%
}

% 'preprint' option.
\DeclareOption{preprint}{%
  \togglefalse{vgtc@submitorcamera}%
  \toggletrue{vgtc@preprint}%
}

% 'hideappendix' option.
\DeclareOption{preprint}{%
  \togglefalse{vgtc@submitorcamera}%
  \toggletrue{vgtc@preprint}%
}

% 'journal' option
\DeclareOption{journal}{%
  \toggletrue{vgtc@journal}%
  \@twosidetrue \@mparswitchtrue %
}

% 'hideappendix' option
\DeclareOption{hideappendix}{%
  \toggletrue{vgtc@hideappendix}%
}

% Here's a warning command for use just below.
\newcommand{\vgtc@optwarning}[1]{%
  \iftoggle{vgtc@submitorcamera}{%
    \ClassWarningNoLine{vgtc}%
    {#1 option used outside of preprint mode.\MessageBreak
      This violates submission specifications}
  }{}
}

% The 'onecolumn' option doesn't work in 'cameraready' mode.

\DeclareOption{onecolumn}{%
  \vgtc@optwarning{onecolumn}
  \renewcommand{\vgtc@columnmode}{onecolumn}}

% The 'twocolumn' option works in 'cameraready' mode.

\DeclareOption{twocolumn}{%
  \renewcommand{\vgtc@columnmode}{twocolumn}}

% Only the '9pt' size works in 'cameraready' mode.

\DeclareOption{9pt}{%
  \renewcommand{\vgtc@pointsize}{9pt}}
\DeclareOption{10pt}{%
  \vgtc@optwarning{10pt}
  \renewcommand{\vgtc@pointsize}{10pt}}
\DeclareOption{11pt}{%
  \vgtc@optwarning{11pt}
  \renewcommand{\vgtc@pointsize}{11pt}}
\DeclareOption{12pt}{%
  \vgtc@optwarning{12pt}
  \renewcommand{\vgtc@pointsize}{12pt}}

% The 'singlespace' option works in 'cameraready' mode.

\DeclareOption{singlespace}{%
  \togglefalse{vgtc@doublespaced}
}

% The 'doublespace' option does not work in 'cameraready' mode.

\DeclareOption{doublespace}{%
  \vgtc@optwarning{doublespace}
  \toggletrue{vgtc@doublespaced}
}

% No 'titlepage' option in 'cameraready' mode.

\DeclareOption{titlepage}{%
  \OptionNotUsed%
  \ClassWarningNoLine{vgtc}{titlepage option not allowed}}

% No 'landscape' mode in 'cameraready' mode, either.

\DeclareOption{landscape}{%
  \OptionNotUsed%
  \ClassWarningNoLine{vgtc}{landscape option not allowed}}

% Pass everything else to the 'article' class, upon which this is based.

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\ProcessOptions
\PassOptionsToClass{\vgtc@columnmode}{article}
\iftoggle{vgtc@journal}{%
  \PassOptionsToClass{twoside}{article}
}{}
\ifdim\vgtc@pointsize>9pt
  \PassOptionsToClass{\vgtc@pointsize}{article}
\fi


% ------------ package loading --------------

\LoadClass{article}
\RequirePackage[T1]{fontenc}                 % to use more chars e.g. umlauts and other diaeresis & support copy & paste of special chars from PDF
\RequirePackage[utf8]{inputenc}              % Translate UTF into ASCII for using non-ASCII chars
\RequirePackage{microtype}                   % use micro-typography (slightly more compact, better to read)
\PassOptionsToPackage{warn}{textcomp}        % to address font issues with \textrightarrow
\RequirePackage{textcomp}                    % use better special symbols
\RequirePackage{times}                       % we use Times as the main font
\renewcommand*\ttdefault{txtt}               % a nicer typewriter font
\RequirePackage{cite}                        % needed to automatically sort the references
\RequirePackage{enumitem}                    % more compact lists
\setlist[enumerate]{itemsep=1pt,topsep=3pt}
\setlist[itemize]{itemsep=1pt,topsep=3pt}
\setlist[description]{itemsep=1pt,topsep=3pt}


%% Load hyperref, cleveref, etc. at the end of the preamble
\AtEndPreamble{%
  \RequirePackage[pagebackref,bookmarks]{hyperref}
  \RequirePackage[all]{hypcap}% makes hyperlinks go to top of floats rather than the caption
  \RequirePackage[svgnames]{xcolor}
  \hypersetup{
    pdfpagemode=UseNone,
    pdftitle={\@title},
    pdfauthor={\@author},
    pdfsubject={VGTC Special Issue Paper for TVCG},
    pdfkeywords={\vgtc@keywords},
    pageanchor=true,
    plainpages=false,       % for problems with page referencing
    hypertexnames=false,    % for handling subfigures correctly
    bookmarksnumbered=false,% include the section numbers in the list
    bookmarksopen=true,     % In the list, display highest level only
    bookmarksopenlevel=3,   % display three levels of bookmarks
    pdfpagemode=UseNone,    % show just the page
    pdfstartview=Fit,       % defail page view is the whole page at once
    pdfborder={0 0 0},      % we don't want those silly boxes for links
    breaklinks=true,        % allow breaking links
    colorlinks=true,        % color all links blue
    linkcolor=NavyBlue,
    urlcolor=NavyBlue,
    citecolor=NavyBlue,
    anchorcolor=black,      % changing this colors te teaser caption using dvips
    nesting=true,
    linktocpage}
  \ifpdf%                   % if we use pdflatex
  \else%                    % else we use pure latex
    \renewcommand{\pdfbookmark}[3][]{}
  \fi


  %% it is recommended to use ``\cref{sec:bla}`` instead of ``Sec.~\ref{sec:bla}''
  %% the following lines load cleveref for consistent, style-dependent cross-references
  %% then customize how sections and tables are referenced. Note that both ``\crefname``
  %% AND ``\Crefname`` must be specified for each, otherwise cleveref uses whatever is
  %% given for both cases.
  \RequirePackage[nameinlink,capitalise]{cleveref}
  \crefname{table}{Tab.}{Tabs.}
  \Crefname{table}{Table}{Tables}
  \crefname{section}{Sec.}{Secs.}
  \Crefname{section}{Section}{Sections}

  %% Hyperlinked ORCID icons for authors. Usage:
  %% \@orcidiconlink{<Author Name>}{<ORCID without https://orcid.org/ included}.
  %% E.g., \orcidiconlink{Cody Dunne}{0000-0002-1609-9776}
  %% See https://tex.stackexchange.com/a/445583/34063
  \RequirePackage{scalerel}
  \RequirePackage{tikz}

  \usetikzlibrary{svg.path}

  \definecolor{orcidlogocol}{HTML}{A6CE39}
  \tikzset{
    orcidlogo/.pic={
        \fill[orcidlogocol] svg{M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z};
        \fill[white] svg{M86.3,186.2H70.9V79.1h15.4v48.4V186.2z}
        svg{M108.9,79.1h41.6c39.6,0,57,28.3,57,53.6c0,27.5-21.5,53.6-56.8,53.6h-41.8V79.1z M124.3,172.4h24.5c34.9,0,42.9-26.5,42.9-39.7c0-21.5-13.7-39.7-43.7-39.7h-23.7V172.4z}
        svg{M88.7,56.8c0,5.5-4.5,10.1-10.1,10.1c-5.6,0-10.1-4.6-10.1-10.1c0-5.6,4.5-10.1,10.1-10.1C84.2,46.7,88.7,51.3,88.7,56.8z};
      }
  }

  \DeclareRobustCommand\@orcidiconlink[2]{%
    \hypersetup{urlcolor=black}%
    \href{https://orcid.org/#2}{#1 \mbox{\scalerel*{% Scale the svg to the size of a pipe (|)
          \begin{tikzpicture}[yscale=-1,transform shape]%
            \pic{orcidlogo};%
          \end{tikzpicture}%
        }{|}}}%
    %
  }

  \RequirePackage{silence}
  \WarningFilter{caption}{Unknown document}
  \WarningFilter{caption}{The option `hypcap=true' will be ignored for this}
  \RequirePackage{caption}
  \RequirePackage[aboveskip=4pt, belowskip=4pt]{subcaption}                % for subfigures
  \captionsetup{subrefformat=parens,font={scriptsize,sf}}
  \newcommand{\subfigsCaption}[1]{\vspace{-.9em}\caption{#1}}
}


% ------------ main code --------------
\newcommand{\vgtc@onlineid}{}
\newcommand{\onlineid}[1]{\renewcommand{\vgtc@onlineid}{#1}}

%\newcommand{\vgtc@preprinttext}{To appear in IEEE Transactions on Visualization and Computer Graphics}
%\newcommand{\preprinttext}[1]{\renewcommand{\vgtc@preprinttext}{#1}}

\newcommand{\vgtc@DOI}{xx.xxxx/TVCG.201x.xxxxxxx/}

\iftoggle{vgtc@journal}{%
  \newcommand{\vgtc@preprinttext}{\parbox{0.9\textwidth}{$\copyright$ \the\year~IEEE. This is the author's version of the article that has been published in IEEE Transactions on Visualization and Computer Graphics. The final version of this record is available at: \href{https://doi.org/\vgtc@DOI}{\color{blue}\vgtc@DOI}}}
}{%
  \newcommand{\vgtc@preprinttext}{\parbox{0.9\textwidth}{$\copyright$ \the\year~IEEE. This is the author's version of the article that has been published in the proceedings of IEEE Visualization conference. The final version of this record is available at: \href{https://doi.org/\vgtc@DOI}{\color{blue}\vgtc@DOI}}}
}


\newcommand{\preprinttext}[1]{\renewcommand{\vgtc@preprinttext}{#1}}
\newcommand{\ieeedoi}[1]{\renewcommand{\vgtc@DOI}{#1}}

\newcommand{\vgtc@reviewtext}{Online Submission ID: \vgtc@onlineid}
\newcommand{\reviewtext}[1]{\renewcommand{\vgtc@reviewtext}{#1}}
\newcommand{\shortauthortitletext}{}
\newcommand{\shortauthortitle}[1]{\renewcommand{\shortauthortitletext}{#1}}

%%Comment from here
\newcommand{\manuscriptnotetxt}{
  Manuscript received xx xxx. 201x; accepted xx xxx. 201x. Date of Publication xx xxx. 201x; date of current version xx xxx. 201x. For information on obtaining reprints of this article, please send  e-mail to: reprints@ieee.org. Digital Object Identifier: xx.xxxx/TVCG.201x.xxxxxxx
}
%% to here to not use the blank

%% NOTE FOR BLANK SPACING
%% uncomment from here
%\newcommand{\manuscriptnotetxt}{\vspace{.25in}}
%%  to here

\newcommand{\manuscriptnote}[1]{\renewcommand{\manuscriptnotetxt}{#1}}
\newcommand{\copyrighttext}{}
\newcommand{\authororcid}[2]{\texorpdfstring{\@orcidiconlink{#1}{#2}}{#1}}% Adds an author with their orcid
\newcommand{\authorfootertext}{}
\newcommand{\authorfooter}[1]{\renewcommand{\authorfootertext}{{\em#1}}}
\newcommand{\firstsectiontxt}{}
\newcommand{\firstsection}[1]{\renewcommand{\firstsectiontxt}{#1}}
\newcommand{\acknowledgments}[1]{%
  \iftoggle{vgtc@review}{}{%
    \section*{Acknowledgments}
    #1
  }
}

\iftoggle{vgtc@journal}{%
  \renewcommand{\figurename}{Fig.}

  \setlength{\textheight}{9.625in}
  \setlength{\topmargin}{-0.625in}
  \setlength{\headheight}{0.0625in}
  \setlength{\headsep}{0.250in}
  \setlength{\footskip}{0.25in}
  \flushbottom
  \setlength{\textwidth}{7.125in}
  \setlength{\columnsep}{0.17in}
  \newlength{\captionmargin}
  \setlength{\captionmargin}{0in}

  \setlength\paperheight {11in}
  \setlength\paperwidth  {8.5in}
  \setlength{\evensidemargin}{-0.375in} %1-(0.3125+0.3125)
  \setlength{\oddsidemargin}{-.25in} %1-(0.4375+0.3125)
}{
  % conference template margins
  \setlength{\textheight}{9.25in}
  \setlength{\topmargin}{-0.700in}
  \setlength{\headheight}{0.2in}
  \setlength{\headsep}{0.250in}
  \setlength{\footskip}{0.5in}
  \flushbottom
  \setlength{\textwidth}{7in}
  \setlength{\oddsidemargin}{-0.25in}
  \setlength{\evensidemargin}{-0.25in}
  \setlength{\columnsep}{2pc}
  %%\setlength{\parindent}{1em}
  \newlength{\captionmargin}
  \setlength{\captionmargin}{0in}
}

% adjust marginpars so that they can be used for comments during editing
\iftoggle{vgtc@journal}{% for journal style
  \addtolength{\marginparwidth}{-1.5mm} % fix margin
}{% conference style
  \addtolength{\marginparwidth}{16mm}
}

\addtolength{\marginparsep}{-2mm} % fix margin

\renewcommand{\ps@plain}%
{%
  \renewcommand{\@oddhead}{}%
  \renewcommand{\@oddfoot}{}%

  \iftoggle{vgtc@preprint}{%
    \renewcommand{\@oddhead}{\hfil\textit{\vgtc@preprinttext}\hfil}%
    \renewcommand{\@oddfoot}{\hfil\textrm{\thepage}\hfil}%
  }{}%

  \iftoggle{vgtc@review}{%
    \renewcommand{\@oddhead}{\hfil\textit{\large\vgtc@reviewtext}\hfil}%
    \renewcommand{\@oddfoot}{\hfil\textrm{\thepage}\hfil}%
  }{}%



  \iftoggle{vgtc@journal}{%
    \ifboolexpr { not togl {vgtc@review} and not togl {vgtc@preprint} }{%       
      % \renewcommand{\@evenhead}{\hfil\sffamily\small\MakeUppercase{\journalidtxt}}%
      % \renewcommand{\@oddhead}{\sffamily\small\MakeUppercase{\shortauthortitletext}\hfil}%
      \renewcommand{\@oddfoot}{}% no page number
      \renewcommand{\@evenfoot}{\@oddfoot}%
    }{}%
  }{%
    \renewcommand{\@evenhead}{\@oddhead}%
    \renewcommand{\@evenfoot}{\@oddfoot}%
  }%
}

% will be used on the first page
\renewcommand{\ps@empty}{%
  \renewcommand{\@oddhead}{}%
  \renewcommand{\@oddfoot}{}%

  \iftoggle{vgtc@preprint}{%
    \renewcommand{\@oddhead}{\hfil\textit{\vgtc@preprinttext}\hfil}%
    \renewcommand{\@oddfoot}{\hfil\textrm{\thepage}\hfil}%
  }{}%

  \iftoggle{vgtc@review}{%
    \renewcommand{\@oddhead}{\hfil\textit{\large\vgtc@reviewtext}\hfil}%
    \renewcommand{\@oddfoot}{\hfil\textrm{\thepage}\hfil}%
  }{}%

  \iftoggle{vgtc@journal}{%
    \ifboolexpr { not togl {vgtc@review} and not togl {vgtc@preprint} }{%
      % \renewcommand{\@oddhead}{\sffamily\small\MakeUppercase{\journalidtxt}\hfil}%
      \renewcommand{\@oddfoot}{\hfil{\small\sffamily\copyrighttext}\hfil}%
    }{}%
  }{}%
  \renewcommand{\@evenhead}{\@oddhead}%
  \renewcommand{\@evenfoot}{\@oddfoot}%
}

% no page numbers - they are added in production

\pagestyle{plain}

\newcommand{\vgtc@setninepoint}{
  \renewcommand\normalsize{%
    \@setfontsize\normalsize\@ixpt\@xpt
    \abovedisplayskip 9\p@ \@plus2\p@ \@minus4\p@
    \abovedisplayshortskip \z@ \@plus3\p@
    \belowdisplayshortskip 6\p@ \@plus3\p@ \@minus3\p@
    \belowdisplayskip \abovedisplayskip
    \let\@listi\@listI}
  \renewcommand\small{%
    \@setfontsize\small\@viipt\@ixpt
    \abovedisplayskip 8.5\p@ \@plus3\p@ \@minus4\p@
    \abovedisplayshortskip \z@ \@plus2\p@
    \belowdisplayshortskip 4\p@ \@plus2\p@ \@minus2\p@
    \def\@listi{\leftmargin\leftmargini
      \topsep 4\p@ \@plus2\p@ \@minus2\p@
      \parsep 2\p@ \@plus\p@ \@minus\p@
      \itemsep \parsep}%
    \belowdisplayskip \abovedisplayskip}
  \renewcommand\footnotesize{%
    \@setfontsize\footnotesize\@viiipt{9.5}%
    \abovedisplayskip 6\p@ \@plus2\p@ \@minus4\p@
    \abovedisplayshortskip \z@ \@plus\p@
    \belowdisplayshortskip 3\p@ \@plus\p@ \@minus2\p@
    \def\@listi{\leftmargin\leftmargini
      \topsep 3\p@ \@plus\p@ \@minus\p@
      \parsep 2\p@ \@plus\p@ \@minus\p@
      \itemsep \parsep}%
    \belowdisplayskip \abovedisplayskip%
  }
  \renewcommand\scriptsize{\@setfontsize\scriptsize\@viiipt{9.5}}
  \renewcommand\tiny{\@setfontsize\tiny\@vpt\@vipt}
  \renewcommand\large{\@setfontsize\large\@xpt\@xiipt}
  \renewcommand\Large{\@setfontsize\Large\@xiipt{14}}
  \renewcommand\LARGE{\@setfontsize\LARGE\@xivpt{18}}
  \renewcommand\huge{\@setfontsize\huge\@xviipt{22}}
  \renewcommand\Huge{\@setfontsize\Huge\@xxpt{25}}
  \selectfont
}
\ifdim\vgtc@pointsize=9pt
  \vgtc@setninepoint
\fi

\newcommand{\vgtc@sectionfont}{}

\newcommand{\sectionfont}[1]{\renewcommand{\vgtc@sectionfont}{#1}}

\renewcommand\section{\@startsection{section}{1}{\z@}%
  {-2ex \@plus -1ex \@minus -.2ex}%
  {0.8ex \@plus .2ex}%
  {\reset@font\normalsize\sffamily\bfseries\scshape\vgtc@sectionfont}}

\renewcommand\subsection{\@startsection{subsection}{2}{\z@}%
  {-1.8ex\@plus -1ex \@minus -.2ex}%
  {0.8ex \@plus .2ex}%
  {\reset@font\normalsize\sffamily\bfseries\vgtc@sectionfont}}

\renewcommand\subsubsection{\@startsection{subsubsection}{3}{\z@}%
  {-1.8ex\@plus -1ex \@minus -.2ex}%
  {0.8ex \@plus .2ex}%
  {\reset@font\sffamily\normalsize\vgtc@sectionfont}}

\renewcommand\paragraph{\@startsection{paragraph}{4}{1em}%
  {1ex \@plus 1ex \@minus.2ex}%
  {-1em}%
  {\reset@font\normalsize\sffamily\vgtc@sectionfont}}

\renewcommand\subparagraph{\@startsection{subparagraph}{5}{\parindent}%
  {3.25ex \@plus1ex \@minus .2ex}%
  {-1em}%
  {\reset@font\normalsize\sffamily\bfseries\vgtc@sectionfont}}

\iftoggle{vgtc@wide}{}{%
  \newcommand{\captionfonts}{\scriptsize\sffamily} % make captionfont 8pt

  \def\instring#1#2{TT\fi\begingroup
    \edef\x{\endgroup\noexpand\in@{#1}{#2}}\x\ifin@}
  \long\def\@makecaption#1#2{%
    \if\instring{Table}{#1}\else\vskip\abovecaptionskip\fi
    \leftskip = \captionmargin \rightskip = \leftskip%
    \sbox\@tempboxa{\captionfonts #1\iftoggle{vgtc@journal}{.}{:} #2}%
    \ifdim \wd\@tempboxa >\hsize
      {\captionfonts #1\iftoggle{vgtc@journal}{.}{:} #2\par}
    \else %single line caption
      \global \@minipagefalse
      \def\@figcaptype{figure}
      \hskip0.0in%needed to make leftskip work
      \hb@xt@\hsize{\iftoggle{vgtc@journal}{\ifx\@captype\@figcaptype\else\hfil\fi}{\hfil}\box\@tempboxa\hfil}%
    \fi
    \if\instring{Table}{#1}\vskip.5\abovecaptionskip\else\vskip\belowcaptionskip\fi%
  }
  %
  % fix the font size of the bibliography to 8pt
  \newdimen\bibindent
  \newdimen\bibspacing
  \setlength\bibindent{1em}
  \setlength{\bibspacing}{\z@}
  \renewenvironment{thebibliography}[1]{%
    \section*{\refname}%
      \scriptsize%
      \@mkboth{\MakeUppercase\refname}{\MakeUppercase\refname}%
      \list{\@biblabel{\@arabic\c@enumiv}}%
        {%
          \settowidth\labelwidth{\@biblabel{#1}}%
          \leftmargin\labelwidth
          \advance\leftmargin\labelsep
          \itemsep\bibspacing    % should this be commented out?
          \parsep\bibspacing     % should this be commented out?
          \@openbib@code
          \usecounter{enumiv}%
          \let\p@enumiv\@empty
          \renewcommand\theenumiv{\@arabic\c@enumiv}%
        }%
      \sloppy
      \clubpenalty4000
      \@clubpenalty \clubpenalty
      \widowpenalty4000%
      \sfcode`\.\@m%
  }
  {%
    \def\@noitemerr
    {\@latex@warning{Empty `thebibliography' environment}}%
    \endlist%
  }
}

\newcommand{\vgtc@empty}{}

\newcommand{\vgtc@affiliation}{}
\newcommand{\affiliation}[1]{\renewcommand{\vgtc@affiliation}{#1}}

\newcommand{\vgtc@category}{}
\newcommand{\category}[1]{\renewcommand{\vgtc@category}{#1}}
\newcommand{\vgtccategory}[1]{\category{#1}}
\vgtccategory{n/a}
\newcommand{\vgtc@papertype}{}
\newcommand{\papertype}[1]{\renewcommand{\vgtc@papertype}{#1}}
\newcommand{\vgtcpapertype}[1]{\papertype{#1}}


%% Check to see if we include the appendix
\iftoggle{vgtc@hideappendix}{%
      % There should not be anything after \end{document}. LaTeX will simply
      % stop and do cleanup, so we can just call it early to remove everything
      % in the appendices w/o issue.
      \renewcommand{\appendix}{\end{document}}% 
		}{}

% Check if a cross reference exists (e.g., for an optionally-removed appendix). If so, do one thing. If not, do the other.
% https://tex.stackexchange.com/questions/111311/how-to-make-a-conditional-reference-to-a-text-label
%
% Example usage:
%
% \iflabelexists{appendix:intuitiveexamples}
%   {\cref{appendix:intuitiveexamples}.}
%   {the appendix, available at \url{} % You have another macro that inserts the OSF link
\RequirePackage{etoolbox}
\newcommand{\iflabelexists}[3]{\ifcsundef{r@#1}{#3}{#2}}


%% handle old commands used in the template gracefully
\newcommand{\vgtcformat}[1]{\ClassError{vgtc}{%
    Format specification with the vgtcformat command no longer required}{}}

\newcommand{\vgtcinsertpkg}{\ClassError{vgtc}{%
    Using the vgtcinsertpkg command no longer required}{}}

\newcommand{\vgtcopening}[1]{%
  \ClassError{vgtc}{%
    The vgtcopening command is no longer needed.\MessageBreak%
    Switch to the maketitle command and abstract environment}{}}


\newcommand{\vgtc@teaser}{}
\newcommand{\teaser}[1]{%
  \renewcommand{\vgtc@teaser}{%
    \newlength{\abstractwidth}%
    \setlength{\abstractwidth}{\linewidth}%
    \addtolength{\abstractwidth}{-.66in}%
    \begin{minipage}{\abstractwidth}
      #1%
    \end{minipage}
    \setlength{\captionmargin}{0in}%
  }%
}

\newcommand{\vgtc@abstxt}{}
\let\origabstract\abstract
\let\endorigabstract\endabstract
\renewcommand{\abstract}[1]{\renewcommand{\vgtc@abstxt}{#1}}

\newcommand{\vgtc@keywords}{}
\newcommand{\keywords}[1]{\renewcommand{\vgtc@keywords}{#1}}

\newcommand{\vgtc@indexterms}{}
\newcommand{\CCScatlist}[1]{\renewcommand{\vgtc@indexterms}{#1}}

\newcommand{\CCScat}[4]{%
  #1 [#2]%
  \ifx#3\vgtc@empty \else : #3\fi%
  \ifx#4\vgtc@empty \else ---#4\fi%
}

\newcommand{\CCScatTwelve}[4]{%
  #1%
  \ifx#2\vgtc@empty \else ---#2\fi%%
  \ifx#3\vgtc@empty \else ---#3\fi%
  \ifx#4\vgtc@empty \else ---#4\fi%
}

% use any of the following to adjust spaces in title block
\newlength{\titlespace}
\setlength{\titlespace}{0.25in}

\newlength{\teaserspace}
\setlength{\teaserspace}{0.0in}

\newlength{\abstxtspace}
\setlength{\abstxtspace}{0.20in}

\renewcommand{\@maketitle}{%
  \iftoggle{vgtc@review}{%
    \begin{center}%
      \renewcommand{\thanks}[1]{}
      {\sffamily\iftoggle{vgtc@journal}{\huge}{\LARGE\bfseries}%
        \vgtc@sectionfont%
        \@title \par}%
      \vspace{1\baselineskip}%
      {Category: \vgtc@category \par}%
      \ifx\vgtc@papertype\vgtc@empty \else%
        {\vspace{1ex}Paper Type: \vgtc@papertype \par}%
      \fi%
      \vspace{\titlespace}%
      \ifx\vgtc@teaser\vgtc@empty \else%
        \begingroup%
        \def\@captype{figure}%
        \vgtc@teaser%
        \endgroup\par%
        \vspace{\teaserspace}%
      \fi%
    \end{center} \par%
  }{%
    \begin{center}%
      {\sffamily\iftoggle{vgtc@journal}{\huge}{\LARGE\bfseries}%
        \vgtc@sectionfont%
        \@title \par}%
      \iftoggle{vgtc@journal}{%
        \vspace{14pt}%
      }{%
        \vspace{1\baselineskip}
      }%
      \large\sffamily\vgtc@sectionfont
      \begin{tabular}[t]{c}%
        \@author
      \end{tabular}\par%
      \ifx\vgtc@affiliation\vgtc@empty \else%
        \par\vspace{1\baselineskip}%
        \vgtc@affiliation\par%
      \fi%
      \iftoggle{vgtc@journal}{\vspace{0.08in}}{\vspace{\titlespace}}%
      \ifx\vgtc@teaser\vgtc@empty \else%
        {
          \begingroup%
          \def\@captype{figure}%
          \vgtc@teaser%
          \endgroup\par%
        }
        \vspace{\teaserspace}%
      \fi%
    \end{center} \par%
  }%
  \iftoggle{vgtc@journal}{%
    {%
      \scriptsize\sffamily%
      \leftskip = 0.33in \rightskip = \leftskip%
      \ifx\vgtc@abstxt\vgtc@empty \else%
        \begingroup%
        {\bfseries Abstract}---\vgtc@abstxt%
        \endgroup\par%
      \fi%
      \ifx\vgtc@keywords\vgtc@empty \else%
        \begingroup%
        \vspace{0.5\baselineskip}%
        \par\noindent \textbf{Index Terms}---\vgtc@keywords%
        \endgroup\par%
      \fi%
    }%
    \begin{center}\includegraphics{diamondrule}\end{center}
    \ifx\firstsectiontxt\vgtc@empty \else
      \section{\firstsectiontxt}
    \fi
  }{}%
}

\let\vgtc@origmaketitle\maketitle
\let\vgtc@origand\and
\renewcommand{\maketitle}{%
  \let\vgtc@title\@title%
  \let\vgtc@author\@author%
  \vgtc@origmaketitle%
  \thispagestyle{empty}%
  \iftoggle{vgtc@doublespaced}{%
    \renewcommand{\baselinestretch}{1.66}\selectfont%
  }{}%
  \iftoggle{vgtc@journal}{% no copyrightspace for journal, but authorfooter
    \iftoggle{vgtc@review}{}{%
      \renewcommand{\thefootnote}{}%
      \footnotetext[0]{
        \begin{flushleft}
          \vskip -6pt
          \begin{list}{\textbullet}{
            \setlength{\partopsep}{0pt}
            \setlength{\topsep}{0pt}
            \setlength{\itemsep}{-2pt}
            \setlength{\itemindent}{-4pt}
            \setlength{\leftmargin}{12pt}%
          }
            \authorfootertext
          \end{list}
          \vskip 4pt
          \textit{\manuscriptnotetxt}
        \end{flushleft}
      }%
      \renewcommand{\thefootnote}{\arabic{footnote}}
    }%
  }{%
    \iftoggle{vgtc@havecopyrightspace}{\copyrightspace}{}%
    \ifx\vgtc@abstxt\vgtc@empty \else%
      \begingroup%
      \begin{origabstract} \vgtc@abstxt \end{origabstract} %
      \endgroup\par%
    \fi%
    \ifx\vgtc@keywords\vgtc@empty \else%
      \begingroup%
      \vspace{0.5\baselineskip}%
      \par\noindent \textbf{Keywords: } \vgtc@keywords%
      \endgroup\par%
    \fi%
    \ifx\vgtc@indexterms\vgtc@empty \else%
      \begingroup%
      \vspace{0.5\baselineskip}%
      \par\noindent \textbf{Index Terms:} \vgtc@indexterms%
      \endgroup\par%
    \fi%
  }%
  \ifx\firstsectiontxt\vgtc@empty \else
    \iftoggle{vgtc@journal}{%
      \section*{}
      \vskip -1.5em
    }{%
      \section{\firstsectiontxt}
    }%
  \fi%
}

\newcommand{\keywordsprefix}{%
  \vspace{0.5\baselineskip}%q
  \par\noindent \textbf{Index Terms - } \vgtc@keywords%
}
\newenvironment{CRcatlistprefix}{%
  \vspace{0.5\baselineskip}%
  \par\noindent \textbf{CR Categories: }%
}{}

% leave a 0.5 inch space at the bottom of the left column
% on the first page for the copyright block.

\newlength{\vgtc@copyrightlength}
\setlength{\vgtc@copyrightlength}{0.5in}

\newcommand{\copyrightspace}{%
  \renewcommand{\thefootnote}{}%
  \footnotetext[0]{\rule[\vgtc@copyrightlength]{2.71828in}{0in}}%
  \renewcommand{\thefootnote}{\arabic{footnote}}
}

\newcommand{\nocopyrightspace}{\togglefalse{vgtc@havecopyrightspace}}
\renewcommand{\footnoterule}{%
  \kern-3pt
  \leftline{\hskip1in\vbox{\hrule width 0.45\columnwidth}\hfil}
  \iftoggle{vgtc@journal}{}{\kern 2.6pt}
}

\newcommand{\vgtc@contactname}{}
\newcommand{\contactname}[1]{\renewcommand{\vgtc@contactname}{#1}}

\newcommand{\vgtc@contactaddress}{}
\newcommand{\contactaddress}[1]{\renewcommand{\vgtc@contactaddress}{#1}}

\newcommand{\vgtc@contactphone}{}
\newcommand{\contactphone}[1]{\renewcommand{\vgtc@contactphone}{#1}}

\newcommand{\vgtc@contactfax}{}
\newcommand{\contactfax}[1]{\renewcommand{\vgtc@contactfax}{#1}}

\newcommand{\vgtc@contactemail}{}
\newcommand{\contactemail}[1]{\renewcommand{\vgtc@contactemail}{#1}}

\newcommand{\vgtc@estpages}{}
\newcommand{\estpages}[1]{\renewcommand{\vgtc@estpages}{#1}}

\InputIfFileExists{vgtc.cfg}
{\typeout{***************************************^^J%
    * Local config file vgtc.cfg used *^^J%
    ***************************************}}
{}
\endinput

% End of file 'vgtc.cls'.

