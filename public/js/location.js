const districtSelect = document.getElementById('districtSelect');
const blockSelect = document.getElementById('blockSelect');


districtSelect.addEventListener('change', function () {
    const selectedDistrict = districtSelect.value;
    const blocks = getBlocks(selectedDistrict);

    blockSelect.innerHTML = '';

    // Add the "-- Select one --" option as the default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select one --';
    blockSelect.appendChild(defaultOption);

    if (blocks.length > 0) {
        blockSelect.disabled = false;
        blocks.forEach(function (block) {
            const option = document.createElement('option');
            option.value = block;
            option.textContent = block;
            blockSelect.appendChild(option);
        });
    } else {
        blockSelect.disabled = true;
        const option = document.createElement('option');
        option.textContent = 'No blocks found';
        blockSelect.appendChild(option);
    }
});

function getBlocks(district) {
    switch (district) {
        case 'bilaspur':
            return ['Bilaspur Sadar', '	Ghumarwin', 'Jhandutta', 'Shree Naina Devi', 'Other'];
        case 'chamba':
            return ['Bharmour', 'Bhattiyat', 'Chamba', 'Mehla', 'Pangi', 'Saluni', 'Tisa', 'Other'];
        case 'hamirpur':
            return ['Bamson', 'Bhoranj', 'Bijhri', 'Hamirpur', 'Nadaun', 'Tira Sujanpur', 'Other'];
        case 'kangra':
            return ["Baijnath", "Bhawarna", "Dehra Gopipur", "Dharamshala", "Fatehpur", "Indora", "Kangra", "Lambagaon", "Nagrota Bagwan",
                "Nagrota Surian", "Nurpur", "Panchrukhi", "Pragpur", "Rait", "Sulah", 'Other'];
        case 'kinnaur':
            return ['Kalpa', 'Nichar', 'Pooh', 'Other'];
        case 'kullu':
            return ['Anni', 'Banjar', 'Kullu', 'Naggar', 'Nirmand', 'Other'];
        case 'lahaul-and-spiti':
            return ['Lahul', 'Spiti', 'Other'];
        case 'mandi':
            return ['Balh', 'Bali Chowki', 'Chauntra', 'Dharmpur', 'Drang', 'Gohar', 'Gopalpur', 'Karsog', 'Mandi Sadar', 'Seraj', 'Sundarnagar', 'Other'];
        case 'shimla':
            return ['Basantpur', 'Chauhara', 'Chaupal', 'Jubbal Kotkhai', 'Kupvi', 'Mashobra', 'Nankhari', 'Narkanda', 'Rampur', 'Rohru', 'Theog', 'Other'];

        case 'sirmaur':
            return ['Nahan', 'Pachhad', 'Paonta Sahib', 'Rajgarh', 'Sangrah', 'Shillai', 'Other'];
        case 'solan':
            return ['Dharampur', 'Akri', 'Kandaghat', 'Kunihar', 'Nalagarh', 'Solan', 'Other'];

        case 'una':
            return ['Amb', 'Bangana', 'Bharwain', 'Gagret', 'Haroli', 'Una', 'Other'];
        default:
            return [];
    }
}