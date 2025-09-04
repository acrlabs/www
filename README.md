# Public ACRL Sites

`www` is the repo for the following public ACRL sites 
- [ACRL](http://appliedcomputing.io) - home of Applied Computing Research Labs
- [SimKube](http://simkube.dev/) - home of SimKube

Both sites are:
- built into static assets using [mkdocs](https://www.mkdocs.org/) for static site generation
- automatically re-deployed via a GitHub action on successful merges to the `master` branch


## Getting Started

### Prerequisites

- Python 3 (^3.11)
- Poetry (for dependency management)
- Git (for version control)
- Just (command runner)


## Development

### Installation

1. `cd` to your preferred directory
2. Clone the repository:
   ```sh
   git clone https://github.com/acrlabs/www.git
   cd www
   ```

### Running Site Previews

1. `cd` to the base directory of your local copy `www` repo
2. Initialize the poetry virtual environment and install dependencies with:
   ```sh
   poetry install
   ```

3. Run the `serve` command:
    ```sh
   just serve {site}
   ```

   Replace `{site}` with either `acrl` (for ACRL site) or `simkube` (for SimKube site), example:
    ```sh
   just serve acrl
   ```

4. The site will now be accessible at:
    -  ACRL - http://localhost:8000
    - SimKube - http://localhost:8001

5. `Ctrl + C` in the same terminal to terminate 

### Contributing

1. Clone the repo

2. Create a feature branch (`git checkout -b feature/amazing-feature`)

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)

5. Test locally (`just serve {site}`)

6. Open a Pull Request to the `master` branch

7. Merge changes upon PR approval
