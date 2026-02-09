---
title: Fuwari Static Web Markdown Navigation
published: 2020-08-28
description: "Complete guide covering all features and Markdown support in the Fuwari blog template."
image: ""
tags: []
category: Essays
location: Fremont, United States
draft: false
---

This blog template is built with [Astro](https://astro.build/). For the things that are not mentioned in this guide, you may find the answers in the [Astro Docs](https://docs.astro.build/).

# 1. Post Front-matter
```yaml
---
title       : {TITLE}
published   : {DATE}
description : {DESCRIPTION}
image       : {COVER_IMAGE_PATH}
tags        : {TAGS}
category    : {CATEGORY}
location    : {LOCATION}
draft       : {BOOLEAN}
---
```

| Attribute     | Description                                                                                                                                                                                                 |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `title`       | The title of the post.                                                                                                                                                                                      |
| `published`   | The date the post was published.                                                                                                                                                                            |
| `updated`     | The date the post was last updated.                                                                                                                                                                         |
| `description` | A short description of the post. Displayed on index page.                                                                                                                                                   |
| `image`       | The cover image path of the post.<br/>1. Start with `http://` or `https://`: Use web image<br/>2. Start with `/`: For image in `public` dir<br/>3. With none of the prefixes: Relative to the markdown file |
| `tags`        | The tags of the post.                                                                                                                                                                                       |
| `category`    | The category of the post.                                                                                                                                                                                   |
| `draft`       | If this post is still a draft, which won't be displayed.                                                                                                                                                    |

# 2. Post File Placement
Your post files should be placed in `src/content/posts/` directory. You can also create subdirectories to better organize your posts and assets.

```
src/content/posts/
├── post-1.md
└── post-2/
    ├── cover.png
    └── index.md
```

# 3. Basic Markdown Syntax
## 3.1 Headers
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## 3.2 Text Formatting
- *Italic text*
- **Bold text**
- ***Bold and italic text***
- ~~Strikethrough~~
- `Inline code`
- [Link to example](https://example.com)
- `![Image alt text](/path/to/image.jpg)` (Example image path)

## 3.3 Lists
Unordered list:
- Item 1
- Item 2
    - Subitem 1
    - Subitem 2

Ordered list:
1. First item
2. Second item
    1. Subitem 1
    2. Subitem 2

## 3.4 Blockquotes
> This is a blockquote.
>
> It can span multiple lines.

## 3.5 Code Blocks
```rust
// This is a code block with syntax highlighting
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let users = vec![
        User::new(1, "Alice".to_string()),
        User::new(2, "Bob".to_string()),
    ];
    
    let user_map = Arc::new(process_users(users));
    println!("Processed users: {:?}", user_map);
    Ok(())
}
```

```
// Code block without syntax highlighting
println!("Hello, world!");
```

## 3.6 Tables
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## 3.7 Horizontal Rule
---

## 3.8 Footnotes and Images

![./template.webp](template.webp)
This is a footnote reference[^1].

[^1]: The Sky over Jade Abyss Lake, Beijing, China.

# 4. Extended Markdown Features
## 4.1 GitHub Repository Cards
You can add dynamic cards that link to GitHub repositories. On page load, the repository information is pulled from the GitHub API.

::github{repo="saicaca/fuwari"}

Create a GitHub repository card with the code `::github{repo="<owner>/<repository>"}`.

## 4.2 Admonitions
Following types of admonitions are supported: `note` `tip` `important` `warning` `caution`

:::note
Highlights information that users should take into account, even when skimming.
:::

:::tip
Optional information to help a user be more successful.
:::

:::important
Crucial information necessary for users to succeed.
:::

:::warning
Critical content demanding immediate user attention due to potential risks.
:::

:::caution
Negative potential consequences of an action.
:::

### 4.2.1 Custom Titles
The title of the admonition can be customized.

:::note[MY CUSTOM TITLE]
This is a note with a custom title.
:::

Basic syntax:
```markdown
:::note
Highlights information that users should take into account, even when skimming.
:::

:::tip[Custom Title]
This is a tip with a custom title.
:::
```

### 4.2.2 GitHub Syntax
> [!NOTE]
> [The GitHub syntax](https://github.com/orgs/community/discussions/16925) is also supported.

```
> [!NOTE]
> The GitHub syntax is also supported.

> [!TIP]
> The GitHub syntax is also supported.
```

## 4.3 Spoilers
You can add spoilers to your text. The text also supports **Markdown** syntax.

The content :spoiler[is hidden **ayyy**]!

```markdown
The content :spoiler[is hidden **ayyy**]!
```

# 5. Media Embedding
## 5.1 Videos
You can embed videos from various platforms like YouTube or Bilibili by copying and pasting the embed code:

### 5.1.1 YouTube
<iframe width="100%" height="468" src="https://www.youtube.com/embed/5gIf0_xpFPI?si=N1WTorLKL0uwLsU_" title="YouTube video player" frameborder="0" allowfullscreen></iframe>

# 6. Draft Posts
You can mark posts as drafts by setting `draft: true` in the frontmatter. Draft posts will not be visible to visitors but can be previewed during development.

When the article is ready for publication, update the "draft" field to "false" in the Frontmatter:

```markdown
---
title: Draft Example
published: 2024-01-11T04:40:26.381Z
tags: [Markdown, Blogging, Demo]
category: Examples
draft: false
---
```

Here, we'll explore how code blocks look using [Expressive Code](https://expressive-code.com/). The provided examples are based on the official documentation, which you can refer to for further details.

# 7. Expressive Code
## 7.1 Syntax Highlighting
[Syntax Highlighting](https://expressive-code.com/key-features/syntax-highlighting/)

### 7.1.1 Regular Syntax Highlighting
```rust
let numbers = vec![1, 2, 3, 4, 5];
let doubled: Vec<i32> = numbers
    .iter()
    .map(|&x| x * 2)
    .filter(|&x| x > 4)
    .collect();
println!("Doubled numbers: {:?}", doubled);
```

### 7.1.2 ANSI Escape Sequences Rendering
```ansi
ANSI colors in terminal output:
- Regular: [31mRed[0m [32mGreen[0m [33mYellow[0m [34mBlue[0m [35mMagenta[0m [36mCyan[0m
- Bold:    [1;31mRed[0m [1;32mGreen[0m [1;33mYellow[0m [1;34mBlue[0m [1;35mMagenta[0m [1;36mCyan[0m
- Dimmed:  [2;31mRed[0m [2;32mGreen[0m [2;33mYellow[0m [2;34mBlue[0m [2;35mMagenta[0m [2;36mCyan[0m

Rust color styling example:
[38;5;160mError:[0m Something went wrong
[38;5;172mWarning:[0m This is just a warning
[38;5;148mSuccess:[0m Operation completed successfully
```

## 7.2 Editor & Terminal Frames
[Editor & Terminal Frames](https://expressive-code.com/key-features/frames/)

### 7.2.1 Code Editor Frames
```rust title="src/main.rs"
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let handles: Vec<_> = (0..3)
        .map(|i| {
            tokio::spawn(async move {
                sleep(Duration::from_millis(100 * i)).await;
                println!("Task {} completed", i);
            })
        })
        .collect();
    
    for handle in handles {
        handle.await?;
    }
    Ok(())
}
```

---

```rust
// src/lib.rs
pub fn hello_world() {
    println!("File name comment example");
}
```

### 7.2.2 Terminal Frames
```bash
cargo run
```

---

```bash title="Terminal session"
cargo build --release
```

### 7.2.3 Frame Type Override
```bash frame="none"
rustc main.rs
```

---

```toml frame="code" title="Cargo.toml"
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
```

## 7.3 Text & Line Markers
[Text & Line Markers](https://expressive-code.com/key-features/text-markers/)

### 7.3.1 Full Lines & Range Marking
```rust {1, 4, 7-8}
// Line 1 - targeted by line number
fn main() {
    let x = 42;
    // Line 4 - targeted by line number
    println!("x = {}", x);
    
    // Line 7 - targeted by range "7-8"
    // Line 8 - targeted by range "7-8"
    let y = x * 2;
}
```

### 7.3.2 Line Marker Types (mark/ins/del)
```rust title="line_markers.rs" del={2} ins={3-4} {6}
fn demo() -> String {
    println!("this line is marked as deleted");
    // This line and the next one are marked as inserted
    println!("this is the second inserted line");

    "this line uses the neutral default marker type".to_string()
}
```

### 7.3.3 Line Marker Labels
```rust {"1":5} del={"2":7-8} ins={"3":10-12}
// labeled_line_markers.rs
struct Button {
    props: Props,
    value: String,
    class_name: String,
    disabled: bool,
    active: bool,
}

impl Button {
    fn render(&self) -> String {
        if self.children.is_some() && !self.active {
            format!("<span>{}</span>", self.children.as_ref().unwrap())
        } else {
            String::new()
        }
    }
}
```

### 7.3.4 Multi-line Long Labels
```rust {"1. Provide the value prop here:":5-6} del={"2. Remove the disabled and active states:":8-10} ins={"3. Add this to render the children inside the button:":12-15}
// labeled_line_markers.rs
struct Button {
    props: Props,

    value: String,
    class_name: String,

    disabled: bool,
    active: bool,
}

impl Button {
    fn render(&self) -> String {
        if self.children.is_some() && !self.active {
            match self.children.as_ref().unwrap() {
                Child::Text(text) => format!("<span>{}</span>", text),
                Child::Element(elem) => elem.to_string(),
            }
        } else {
            String::new()
        }
    }
}
```

### 7.3.5 Diff-like Syntax
```diff
+pub fn new_function() -> Result<String, Error> {
-this fn old_function() -> String {
    Ok("this is a regular line".to_string())
+    Ok("this line will be marked as inserted".to_string())
 }
-this line will be marked as deleted
```

---

```diff
--- a/src/main.rs
+++ b/src/main.rs
@@ -1,3 +1,4 @@
+use std::collections::HashMap;
 fn main() {
-    println!("Hello, world!");
+    let mut map = HashMap::new();
+    map.insert("key", "value");
 }
```

### 7.3.6 Syntax Highlighting + Diff
```diff lang="rust"
  fn this_is_rust() {
    // This entire block gets highlighted as Rust,
    // and we can still add diff markers to it!
-   println!("Old code to be removed");
+   println!("New and shiny code!");
  }
```

### 7.3.7 Inline Text Marking
```rust "given text"
fn demo() -> String {
    // Mark any given text inside lines
    "Multiple matches of the given text are supported".to_string()
}
```

### 7.3.8 Regular Expression Marking
```rust /ye[sp]/
println!("The words yes and yep will be marked.");
```

### 7.3.9 Forward Slash Escaping
```rust /\/ho.*\//
std::fs::write("/home/test.txt", "Test")?;
```

### 7.3.10 Inline Marker Types
```rust "return true;" ins="inserted" del="deleted"
fn demo() -> bool {
    println!("These are inserted and deleted marker types");
    // The return statement uses the default marker type
    true
}
```

## 7.4 Word Wrap
[Word Wrap](https://expressive-code.com/key-features/word-wrap/)

### 7.4.1 Per-block Word Wrap Config
```rust wrap
// Example with wrap
fn get_long_string() -> String {
    "This is a very long string that will most probably not fit into the available space unless the container is extremely wide".to_string()
}
```

---

```rust wrap=false
// Example with wrap=false
fn get_long_string() -> String {
    "This is a very long string that will most probably not fit into the available space unless the container is extremely wide".to_string()
}
```

### 7.4.2 Wrapped Line Indentation
```rust wrap preserveIndent
// Example with preserveIndent (enabled by default)
fn get_long_string() -> String {
    "This is a very long string that will most probably not fit into the available space unless the container is extremely wide".to_string()
}
```

---

```rust wrap preserveIndent=false
// Example with preserveIndent=false
fn get_long_string() -> String {
    "This is a very long string that will most probably not fit into the available space unless the container is extremely wide".to_string()
}
```

## 7.5 Collapsible Sections
[Collapsible Sections](https://expressive-code.com/plugins/collapsible-sections/)

```rust collapse={1-5, 12-14, 21-24}
// All this boilerplate setup code will be collapsed
use std::sync::{Arc, Mutex};
use tokio::runtime::Runtime;

let runtime = Arc::new(Mutex::new(Runtime::new()?));
let engine = Engine::new(runtime.clone());

// This part of the code will be visible by default
engine.do_something(1, 2, 3, calc_fn)?;

fn calc_fn() -> i32 {
    // You can have multiple collapsed sections
    let a = 1;
    let b = 2;
    let c = a + b;

    // This will remain visible
    println!("Calculation result: {} + {} = {}", a, b, c);
    c
}

// All this code until the end of the block will be collapsed again
engine.close_connection()?;
engine.free_memory();
engine.shutdown(ShutdownReason::EndOfExample)?;
```

## 7.6 Line Numbers
[Line Numbers](https://expressive-code.com/plugins/line-numbers/)

### 7.6.1 Per-block Line Number Display
```rust showLineNumbers
// This code block will show line numbers
use std::collections::BTreeMap;

let mut scores = BTreeMap::new();
scores.insert("Alice", 95);
scores.insert("Bob", 87);
println!("Total players: {}", scores.len());
```

---

```rust showLineNumbers=false
// Line numbers are disabled for this block
println!("Hello?");
println!("Sorry, do you know what line I am on?");
```

### 7.6.2 Custom Starting Line Number
```rust showLineNumbers startLineNumber=5
println!("Greetings from line 5!");
println!("I am on line 6");
```



# 8. Math Equations

Inline math equations go in like so: $\omega = d\phi / dt$. Display math should get its own line and be put in double-dollarsigns:

$$
\begin{align*}
e^x &= 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \frac{x^4}{4!} + \frac{x^5}{5!} + \frac{x^6}{6!} + \frac{x^7}{7!} + \frac{x^8}{8!} + \frac{x^9}{9!} + \frac{x^{10}}{10!} + \cdots \\
\sin(x) &= x - \frac{x^3}{3!} + \frac{x^5}{5!} - \frac{x^7}{7!} + \frac{x^9}{9!} - \frac{x^{11}}{11!} + \frac{x^{13}}{13!} - \frac{x^{15}}{15!} + \cdots \\
\cos(x) &= 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \frac{x^6}{6!} + \frac{x^8}{8!} - \frac{x^{10}}{10!} + \frac{x^{12}}{12!} - \frac{x^{14}}{14!} + \cdots
\end{align*}
$$

And note that you can backslash-escape any punctuation characters which you wish to be displayed literally, ex.: \`foo\`, \*bar\*, etc.

## 8.1 Linear Algebra Formulas

Matrix operation example:

$$
\mathbf{A} = \begin{pmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{pmatrix}, \quad
\mathbf{B} = \begin{pmatrix}
b_{11} & b_{12} \\
b_{21} & b_{22} \\
b_{31} & b_{32}
\end{pmatrix}
$$

Matrix multiplication:

$$
\mathbf{C} = \mathbf{A}\mathbf{B} = \begin{pmatrix}
c_{11} & c_{12} \\
c_{21} & c_{22} \\
c_{31} & c_{32}
\end{pmatrix}
$$

Where:

$$
c_{ij} = \sum_{k=1}^{3} a_{ik}b_{kj}
$$

Eigenvalue problem:

$$
\det(\mathbf{A} - \lambda\mathbf{I}) = 0
$$

## 8.2 Partial Differential Equations

### 8.2.1 Heat Equation

One-dimensional heat equation:

$$
\frac{\partial u}{\partial t} = \alpha \frac{\partial^2 u}{\partial x^2}
$$

Three-dimensional heat equation:

$$
\frac{\partial T}{\partial t} = \alpha \left(\frac{\partial^2 T}{\partial x^2} + \frac{\partial^2 T}{\partial y^2} + \frac{\partial^2 T}{\partial z^2}\right)
$$

### 8.2.2 Wave Equation

One-dimensional wave equation:

$$
\frac{\partial^2 u}{\partial t^2} = c^2 \frac{\partial^2 u}{\partial x^2}
$$

### 8.2.3 Laplace Equation

Two-dimensional Laplace equation:

$$
\frac{\partial^2 \phi}{\partial x^2} + \frac{\partial^2 \phi}{\partial y^2} = 0
$$

### 8.2.4 Navier-Stokes Equations

Navier-Stokes equations for incompressible fluids:

$$
\frac{\partial \mathbf{u}}{\partial t} + (\mathbf{u} \cdot \nabla)\mathbf{u} = -\frac{1}{\rho}\nabla p + \nu \nabla^2 \mathbf{u} + \mathbf{f}
$$

Continuity equation:

$$
\nabla \cdot \mathbf{u} = 0
$$

## 8.3 Vector Calculus

Gradient:

$$
\nabla f = \frac{\partial f}{\partial x}\mathbf{i} + \frac{\partial f}{\partial y}\mathbf{j} + \frac{\partial f}{\partial z}\mathbf{k}
$$

Divergence:

$$
\nabla \cdot \mathbf{F} = \frac{\partial F_x}{\partial x} + \frac{\partial F_y}{\partial y} + \frac{\partial F_z}{\partial z}
$$

Curl:

$$
\nabla \times \mathbf{F} = \begin{vmatrix}
\mathbf{i} & \mathbf{j} & \mathbf{k} \\
\frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\
F_x & F_y & F_z
\end{vmatrix}
$$
