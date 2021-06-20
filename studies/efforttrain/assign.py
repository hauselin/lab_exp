import itertools
import csv
import json

num_rockets = 6
num_patterns = 6

rockets = []
patterns = []
for r in range(num_rockets):
    rockets.append('rocket' + f"{r+1:02}")
for p in range(num_patterns):
    patterns.append('pattern' + f"{p+1:02}")

rocket_permutations = list(itertools.permutations(rockets, 2))
pattern_permutations = list(itertools.permutations(patterns, 2))

train_types = ['dotmotion', 'update']
pretrain_orders = list(itertools.permutations(train_types, 2))
posttrain_orders = list(itertools.permutations(train_types, 2))

colour_hexcodes = {
    'red': '#D00000',
    'orange': '#FF9505',
    'green': '#6DA34D',
    'blue': '#3772FF'
}
colour_permutations = [
    "blue-green-orange-red",
    "blue-orange-green-red",
    "blue-red-orange-green",
    "green-orange-blue-red",
    "green-red-blue-orange",
    "orange-red-blue-green"
]
colour_code_permutations = []
for perm in colour_permutations:
    code_permutation = ''
    colour_names = perm.split('-')
    for colour in colour_names:
        code_permutation += colour_hexcodes[colour] + '-'
    colour_code_permutations.append(code_permutation[0:-1])

subjects = []
for c in range(len(colour_code_permutations)):
    for r in range(len(rocket_permutations)):
        for p in range(len(pattern_permutations)):
            for pre in range(len(pretrain_orders)):
                for post in range(len(posttrain_orders)):
                    subject = {
                        'rocket_easy': rocket_permutations[r][0],
                        'rocket_hard': rocket_permutations[r][1],
                        'pattern_easy': pattern_permutations[p][0],
                        'pattern_hard': pattern_permutations[p][1],
                        'colour_hex': colour_code_permutations[c],
                        'colour_name': colour_permutations[c],
                        'pretrain_order': '-'.join(pretrain_orders[pre]),
                        'posttrain_order': '-'.join(posttrain_orders[post]),
                    }
                    subjects.append(subject)

print(len(subjects))
# print(subjects)

with open('assign.csv', mode='w') as file:
    writer = csv.writer(file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    writer.writerow(['rocket_easy', 'rocket_hard', 'pattern_easy', 'pattern_hard', 'colour_hex', 'colour_name', 'pretrain_order', 'posttrain_order'])
    for subject in subjects:
        writer.writerow([
            subject['rocket_easy'],
            subject['rocket_hard'],
            subject['pattern_easy'],
            subject['pattern_hard'],
            subject['colour_hex'],
            subject['colour_name'],
            subject['pretrain_order'],
            subject['posttrain_order']
        ])

with open('assign.txt', 'w') as outfile:
    json.dump(subjects, outfile)