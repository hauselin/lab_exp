function update_array(array, new_entry) {
    array.shift();
    array.push(new_entry);
    return array
}