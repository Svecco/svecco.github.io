---
title: Testing
published: 2022-08-28
description: "Complete guide covering all features and Markdown support in the Fuwari blog template."
image: ""
tags: []
category: Essays
location: Fremont, United States
draft: false
---

```rust
#[cfg_attr(test, automock)]
pub trait ProducerCoreBackend: Send + Sync + 'static {
    fn send_internal(
        &self,
        stream: &Identifier,
        topic: &Identifier,
        msgs: Vec<IggyMessage>,
        partitioning: Option<Arc<Partitioning>>,
    ) -> impl Future<Output = Result<(), IggyError>> + Send;
}
```