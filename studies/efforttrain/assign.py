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

