import itertools

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

print(colour_code_permutations)