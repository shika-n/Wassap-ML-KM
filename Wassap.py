# CONSTANTS
docsNum = 1
idkwgo = True
sleepInterval = 2
genSim = True
hashNum = 25
outputSum = 0
# Experimental
useGlobalIDF = False

# idkwgo thingy
def idkinfo(str, useInterval = False):
	if not idkwgo:
		return
	print(str)
	if useInterval:
		sleep(sleepInterval)

# Libraries
from math import log, log10
from time import sleep
try:
	idkinfo("Importing NLTK")
	from nltk import sent_tokenize, word_tokenize
except:
	print("Error importing NLTK. Make sure you have NLTK installed.")
	sleep(2)
	exit()

# Data-holding variables
rawDatas = [] # rawDatas[doc]
docsSents = [] # docsSents[doc][sent]


IDF = {} # For global IDF

def loadConfig():
	global docsNum, idkwgo, sleepInterval, genSim, hashNum, outputSum, useGlobalIDF

	idkinfo("Loading configurations")
	try:
		with open("config.txt") as conf:
			line = conf.readline()
			while line != "":
				values = line.replace(" ", "").replace("	", "").replace("\n", "").split("=")
				if values[0] == "docsNum":
					docsNum = int(values[1])
				elif values[0] == "idkwgo":
					if values[1].upper() == "TRUE":
						idkwgo = True
					elif values[1].upper() == "FALSE":
						idkwgo = False
				elif values[0] == "sleepInterval":
					sleepInterval = int(values[1])
				elif values[0] == "genSim":
					if values[1].upper() == "TRUE":
						genSim = True
					elif values[1].upper() == "FALSE":
						genSim = False
				elif values[0] == "hashNum":
					hashNum = int(values[1])
				elif values[0] == "outputSum":
						outputSum = int(values[1])
				elif values[0] == "useGlobalIDF":
					if values[1].upper() == "TRUE":
						useGlobalIDF = True
					elif values[1].upper() == "FALSE":
						useGlobalIDF = False
				line = conf.readline()
	except:
		print("Failed to load configuration file (config.txt)")
		sleep(2)
		exit()

def initDocs():
	for i in range(0, docsNum):
		fileName = "data/doc{}.txt".format(i + 1)

		try:
			with open(fileName) as doc:
				idkinfo("Reading: " + fileName)
				rawDatas.insert(i, doc.read())
		except:
			print("Failed to read file: " + fileName)
			sleep(2)
			exit()
		
		docsSents.insert(i, [])
		docsSents[i] = sent_tokenize(rawDatas[i])

def initIDF():
	idkinfo("Initializing IDF")
	for i in range(0, docsNum):
		for sent in docsSents[i]:
			words = set(word_tokenize(sent))
			for word in words:
				if word not in IDF:
					IDF[word] = 0

	for i in range(0, docsNum):
		words = set(word_tokenize(rawDatas[i]))
		for word in words:
			if word in IDF:
				IDF[word] += 1
	
	for word in IDF:
		IDF[word] = log(docsNum / IDF[word])

def kMeans(scores, N, docNo):
	k = 0

	if N <= 20:
		k = N - 4
	else:
		k = N - 20

	if k <= 0:
		k = 1
	
	firstLoop = True
	minVal = 0
	maxVal = 0
	for scoreKey in scores:
		score = scores[scoreKey]
		if firstLoop:
			minVal = score
			maxVal = score
			firstLoop = False
		else:
			if score < minVal:
				minVal = score
			if score > maxVal:
				maxVal = score

	idkinfo("{} centroids used in {} sentences document.".format(k, N))

	centroids = []
	rangeBetween = 0
	if k > 1:
		rangeBetween = (maxVal - minVal) / (k - 1)
	else:
		rangeBetween = minVal

	for i in range(0, k):
		centroids.insert(i, i * rangeBetween + minVal)

	sentToCent = {}
	for scoreKey in scores:
		sentToCent[scoreKey] = -1

	updateFlag = True
	iterNo = 0

	if genSim:
		f = open("sim/sim{}.txt".format(docNo + 1), 'w')
		f.write("====Data Points====\n")
		for sent in docsSents[docNo]:
			orSent = ""
			if sent[:hashNum] in scores:
				orSent = sent.replace("\n", "")
				f.write("{} - {}\n".format(scores[sent[:hashNum]], orSent))

	while updateFlag:
		iterNo += 1
		idkinfo("Iteration No. {}".format(iterNo))
		updateFlag = False
		for scoreKey in scores:
			minDist = -1
			minDistCent = -1

			if sentToCent[scoreKey] != -1:
				minDist = abs(scores[scoreKey] - centroids[sentToCent[scoreKey]])

			for i in range(0, k):
				dist = abs(scores[scoreKey] - centroids[i])
				if minDist == -1 or dist <= minDist:
					minDist = dist
					minDistCent = i
			
			if minDistCent != sentToCent[scoreKey]:
				sentToCent[scoreKey] = minDistCent
				updateFlag = True

		if genSim:
			f.write("====Centroid Iteration No. {}====\n".format(iterNo))
			for cent in centroids:
				f.write(str(cent) + "\n")

		lonelyCentroid = 0
		for i in range(0, k):
			total = 0
			num = 0
			for scoreKey in scores:
				if sentToCent[scoreKey] == i:
					total += scores[scoreKey]
					num += 1
			try:
				lastPos = centroids[i]
				centroids[i] = total / num
				if lastPos == centroids[i]:
					idkinfo("Centroid No. {} has {} members. Position doesn't change.".format(i + 1, num))
				else:
					idkinfo("Centroid No. {} has {} members. Moved from {} to {}".format(i + 1, num, lastPos, centroids[i]))
			except:
				lonelyCentroid += 1

		idkinfo("{} centroids are lonely.\n".format(lonelyCentroid), True)

	if genSim:
		f.close()

	return sentToCent

def getSummary(docNo):
	summary = ""

	wordFreq = {}
	sentScores = {}

	for sent in docsSents[docNo]:
		for word in word_tokenize(sent):
			if word in wordFreq:
				wordFreq[word] += 1
			else:
				wordFreq[word] = 1

	totalFreq = 0
	for wordKey in wordFreq:
		totalFreq += wordFreq[wordKey]

	for sent in docsSents[docNo]:
		score = 0
		words = word_tokenize(sent)
		for word in words:
			tf = wordFreq[word] / totalFreq
			idf = 0
			if useGlobalIDF:
				idf = IDF[word]
			else:
				idf = log10(len(docsSents[docNo]) / wordFreq[word])
			score += tf * idf
		sentScores[sent[:hashNum]] = score / len(words)

	sentToCent = kMeans(sentScores, len(docsSents[docNo]), docNo)

	centMemCount = {}
	for sentKey in sentToCent:
		if sentToCent[sentKey] in centMemCount:
			centMemCount[sentToCent[sentKey]] += 1
		else:
			centMemCount[sentToCent[sentKey]] = 1

	highestMemCount = -1
	for centKey in centMemCount:
		if centMemCount[centKey] > highestMemCount:
			highestMemCount = centMemCount[centKey]
	
	centUsed = []
	for centKey in centMemCount:
		if centMemCount[centKey] == highestMemCount:
			centUsed.insert(len(centUsed), centKey)

	sentCount = 0
	for sent in docsSents[docNo]:			
		if sent[:hashNum] in sentToCent and sentToCent[sent[:hashNum]] in centUsed:
			summary += sent + "\n\n"
			sentCount += 1

	summary += "\n\nThis is {0:.2f}%% of the original content.".format(sentCount * 100 / len(docsSents[docNo]))

	return summary
		

def main():
	loadConfig()
	initDocs()

	if useGlobalIDF:
		initIDF()

	for i in range(0, docsNum):
		summary = getSummary(i)
		if outputSum in [0, 2]:
			print("\n================================")
			print("Summary for document No. {}\n".format(i + 1))
			print(summary)
		if outputSum in [1, 2]:
			with open("sum/sum{}.txt".format(i + 1), "w") as sum:
				sum.write(summary)

if __name__ == "__main__":
	main()