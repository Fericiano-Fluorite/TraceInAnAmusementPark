import pandas as pd
from skimage import io
import matplotlib.pyplot as plt
import json

picked_id = 1591741
movement_input_file = 'park-movement-Fri.csv'
route_output_file = 'route-' + str(picked_id) + '.csv'
movement = pd.read_csv(movement_input_file, header=0)

print(movement)
route = movement[movement['id'] == picked_id]

route.to_csv(route_output_file, index=False)