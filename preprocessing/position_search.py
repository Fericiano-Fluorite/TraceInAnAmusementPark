import pandas as pd
from skimage import io
import matplotlib.pyplot as plt
import json

movement_input_file = 'park-movement-Fri.csv'
rides_input_file = 'rides.csv'
output_file = 'ride-position-Fri.json'

movement = pd.read_csv(movement_input_file, header=0)
# checkins_X = movement[movement['type']=='check-in']['X'].values
# checkins_Y = movement[movement['type']=='check-in']['Y'].values
# assert (len(checkins_X) == len(checkins_Y))
#
# positions = set()
# for e in zip(checkins_X, checkins_Y):
#     positions.add(e)
# with open(tmp_input_file, "r") as file:
#     for a in file:
#         a = a.split(" ")
#         x = (int(a[0]), 100-int(a[1]))
#         positions.add(x)
# positions = list(positions)
# positions.sort(key=lambda x: x[0])

# background = io.imread('Park_Map.jpg')
# ih, iw, _ = background.shape
# w = h = 100
#
# edge = 45
# for i in positions:
#     ad_back = background.copy()
#     ix = int(i[0] * iw / w)
#     iy = int((h-i[1]) * ih / h)
#     for a in range(ix-edge, ix+edge+1):
#         if a > 0 and a < iw:
#             for b in range(iy-edge, iy+edge+1):
#                 if b > 0 and b < ih:
#                     ad_back[b][a] = [0,0,0]
#     print(i[0], i[1])
#     io.imshow(ad_back)
#     plt.show()
rides = {}
with open(rides_input_file, "r") as file:
    for i in file:
        a = i.split(",")
        pos = (int(a[0]), int(a[1]))
        rides[pos] = {'type': a[2], 'id': a[3].strip(), 'population': []}


def next_time_calc(cur):
    cur = cur.split(" ")
    date = cur[0]
    time = cur[1]
    tmp = time.split(":")
    hr = int(tmp[0])
    mn = int(tmp[1])
    mn += 2
    if mn >= 60:
        mn -= 60
        hr += 1
    if hr == 24 and mn > 0:
        return None
    elif hr > 24:
        return None
    else:
        return f"{date} {hr:02}:{mn:02}:00"


cur_time = '2014-6-06 08:00:00'
next_time = next_time_calc(cur_time)

while next_time is not None:
    print(cur_time, next_time)
    movement_time = movement.loc[(movement['Timestamp']>=cur_time) & (movement['Timestamp']<next_time)]
    for each in rides:
        x, y = each
        pop = len(movement_time.loc[(movement_time['X'] == x) & (movement_time['Y'] == y)])
        rides[each]['population'].append(pop)
    cur_time = next_time
    next_time = next_time_calc(cur_time)


rides_list = []
for each in rides:
    a = {}
    a['x'] = each[0]
    a['y'] = each[1]
    a['population'] = rides[each]['population']
    a['type'] = rides[each]['type']
    a['id'] = rides[each]['id']
    rides_list.append(a)

rides_json = json.dumps(rides_list)
with open(output_file, "w") as file:
    print(rides_json, file=file)
    file.close()

