import numpy as np
import argparse
import imutils
import sys
import cv2

classes="action_recognition_kinetics.txt"
inputs="2.mp4"
model="resnet-34_kinetics.onnx"

CLASSES = open(classes).read().strip().split("\n")
SAMPLE_DURATION = 16
SAMPLE_SIZE = 112

print("[INFO] loading human activity recognition model...")
net = cv2.dnn.readNet(model)

print("[INFO] accessing video stream...")
vs = cv2.VideoCapture(inputs if inputs else 0)
index=0
while True:
	
	frames = []

	for i in range(0, SAMPLE_DURATION):
		(hasframe, frame) = vs.read()

		if not hasframe:
			print("[INFO] no frame read from stream - exiting")
			sys.exit(0)

		
		frame = imutils.resize(frame, width=1000)
		frames.append(frame)

	blob = cv2.dnn.blobFromImages(frames, 1.0,
		(SAMPLE_SIZE, SAMPLE_SIZE), (114.7748, 107.7354, 99.4750),
		swapRB=True, crop=True)
	blob = np.transpose(blob, (1, 0, 2, 3))
	blob = np.expand_dims(blob, axis=0)

	net.setInput(blob)
	outputs = net.forward()
	label = CLASSES[np.argmax(outputs)]

	for frame in frames:
		if index>23:
			cv2.rectangle(frame, (0, 0), (300, 40), (0, 0, 0), -1)
			cv2.putText(frame, "Emergency", (10, 25), cv2.FONT_HERSHEY_SIMPLEX,
				0.8, (255, 255, 255), 2)

		cv2.imshow("Activity Recognition", frame)
		key = cv2.waitKey(1) & 0xFF

		if key == ord("q"):
			break
	index=index+1