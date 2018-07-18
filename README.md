# Wassap-ML-KM (Machine Learning - K-Means)
Wassap is a university project on Artificial Intelligence subject.\
It is basically a text summarizer built using Python and NLTK as its library.\
Code is a bit messy and under-documented.

## Method
We use this [paper](http://www.academia.edu/9480745/Extraction_based_approach_for_text_summarization_using_k-means_clustering) as a reference on how to do K-Means algorithm. We recommend you to read the paper to understand how K-Means algorithm works. Searching for a visualizer will be helpful too.

## Configurations
There are 7 settings that we can change in `config.txt` file:
- `docsNum` define how many from 1 to N documents you want to summarize. Documents are in the format of `docsN.txt` and are expected to be inside `data` folder.
- `idkwgo` basically will print out all of the process going on.
- `sleepInterval` will pause after each process so we can read for a moment.
- `genSim` we provide a simulator to see visually how the program works. When set to `true` `simN.txt` will be generated in `sim` folder.
- `hashNum` this is the number of characters from the start of a sentence that we use to store the sentence itself. Low numbers mean an overlap will likely to happen, high numbers may introduce error when sentence length is shorter.
- `outputSum`
	- `1` will show the final summary right on the console.
	- `2` will save the summary to a file `sumN.txt` in `sum` folder.
	- `3` will do both what `1` and `2` do.
- `useGlobalIDF`
	- `false` will make Wassap score words per document.
	- `true` will make Wassap score words by using all documents.