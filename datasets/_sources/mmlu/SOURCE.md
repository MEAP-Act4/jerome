# MMLU source data

These JSON files are cached downloads of the MMLU `test` split, pulled from the
Hugging Face datasets-server for the `cais/mmlu` dataset.

- Dataset card: https://huggingface.co/datasets/cais/mmlu
- License: MIT (see `LICENSE.txt`)
- Paper: Hendrycks, D., Burns, C., Basart, S., Zou, A., Mazeika, M., Song, D., &
  Steinhardt, J. (2021). Measuring Massive Multitask Language Understanding.
  ICLR 2021. https://arxiv.org/abs/2009.03300

Each file contains `question`, `subject`, `choices[4]`, and `answer` (0-3),
plus the fetch timestamp and provenance metadata. Re-download with:

```bash
npm run datasets:fetch
```
