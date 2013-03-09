/*
 * Copyright MADE/YOUR/DAY OG <mail@madeyourday.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Myd.Sudoku Class
 */
Myd.Sudoku = (function() {

	/**
	 * Myd.Sudoku Constructor
	 * @param integer size the size of the sudoku
	 * @param string  seed the random seed (optional)
	 */
	function Sudoku(size, element, seed) {

		if (seed) {
			Math.seedrandom(seed);
		}
		if (! size) {
			size = 4;
		}
		this.size = size;
		this.areaSize = Math.sqrt(size);
		this.areaSize = this.areaSize === Math.floor(this.areaSize) ?
			this.areaSize :
			0;
		this.length = size * size;
		this.fields = new Uint8Array(new ArrayBuffer(this.length));

		this.count = 0;

		this.createIndexCache();
		this.fill(0);
		this.eraseAllPossible();

		this.render(element);

	}

	/**
	 * renders the sudoku
	 * @param HTMLElement element
	 */
	Sudoku.prototype.render = function(element) {

		var html = '<table><tbody><tr>';

		for (var i = 0; i < this.length; i++) {
			if (i % this.size === 0 && i) {
				html += '</tr><tr>';
			}
			html += '<td>' + (this.fields[i] ? this.fields[i] : '<input maxlength="1">')  + '</td>';
		}

		element.innerHTML = html + '</tr></tbody></table>';

	};

	/**
	 * fill
	 * @param integer index
	 */
	Sudoku.prototype.fill = function(index) {

		if (index >= this.length) {
			return true;
		}

		var numbers = this.shuffle(this.possibleNumbers(index)),
			length = numbers.length;

		if (this.fields[index]) {
			return length && this.fill(index + 1);
		}

		for (var i = 0; i < length; i++) {
			this.fields[index] = numbers[i];
			if (this.fill(index + 1)) {
				return true;
			}
		}
		this.fields[index] = 0;

		return false;

	};

	/**
	 * eraseAllPossible
	 */
	Sudoku.prototype.eraseAllPossible = function() {

		var fields = this.shuffle(this.range(this.length, 0)),
			lastNumber;

		for (var i = 0; i < this.length; i++) {
			lastNumber = this.fields[fields[i]];
			this.fields[fields[i]] = 0;
			if (this.getSolutionsCount(true) > 1) {
				this.fields[fields[i]] = lastNumber;
			}
		}

	};

	/**
	 * getSolutionsCount
	 * @param boolean breakonmore break if there are more than one possible solution
	 */
	Sudoku.prototype.getSolutionsCount = function(breakonmore) {

		var emptyIndexes = [],
			length,
			solutions = 0,
			possibleNumbers = [],
			possibleNumbersIndex = [],
			pnnumbers,
			pnlength,
			pnpossibles,
			pnpossiblesLength;

		for (var i = 0; i < this.length; i++) {
			if (! this.fields[i]) {
				emptyIndexes.push(i);
			}
		}
		length = emptyIndexes.length;

		for (i = 0; i < length; i++) {
			if (i < 0) {
				break;
			}
			if (breakonmore && solutions > 1) {
				this.fields[emptyIndexes[i]] = 0;
				delete possibleNumbersIndex[i];
				possibleNumbersIndex[i - 1]++;
				i -= 2;
				continue;
			}
			if (i in possibleNumbersIndex) {
				if (! possibleNumbers[i][possibleNumbersIndex[i]]) {
					this.fields[emptyIndexes[i]] = 0;
					if (! i) {
						break;
					}
					delete possibleNumbersIndex[i];
					possibleNumbersIndex[i - 1]++;
					i -= 2;
					continue;
				}
			}
			else {
				pnnumbers = new Uint8Array(new ArrayBuffer(this.size));
				pnlength = this.indexCache[emptyIndexes[i]].length;
				pnpossiblesLength = this.size;

				for (var pni = 0; pni < this.size; pni++) {
					pnnumbers[pni] = pni + 1;
				}

				for (pni = 0; pni < pnlength; pni++) {
					if (this.fields[this.indexCache[emptyIndexes[i]][pni]] && pnnumbers[this.fields[this.indexCache[emptyIndexes[i]][pni]] - 1]) {
						pnnumbers[this.fields[this.indexCache[emptyIndexes[i]][pni]] - 1] = 0;
						pnpossiblesLength--;
					}
				}

				possibleNumbers[i] = new Uint8Array(new ArrayBuffer(pnpossiblesLength));

				var pnj = 0;
				for (pni = 0; pni < this.size; pni++) {
					if (pnnumbers[pni]) {
						possibleNumbers[i][pnj] = pnnumbers[pni];
						pnj++;
					}
				}

				if (i === length - 1) {
					solutions += possibleNumbers[i].length;
					possibleNumbersIndex[i - 1]++;
					i -= 2;
					continue;
				}
				possibleNumbersIndex[i] = 0;
			}
			if (! possibleNumbers[i].length) {
				delete possibleNumbersIndex[i];
				possibleNumbersIndex[i - 1]++;
				i -= 2;
				continue;
			}
			this.fields[emptyIndexes[i]] = possibleNumbers[i][possibleNumbersIndex[i]];
		}

		return solutions;

	};

	/**
	 * create index cache
	 */
	Sudoku.prototype.createIndexCache = function() {

		var indexCache = [],
			indexObj;

		for (var i = 0; i < this.length; i++) {

			indexObj = {};

			for (var col = Math.floor(i / this.size) * this.size, colend = col + this.size; col < colend; col ++) {
				if (col !== i) {
					indexObj[col] = true;
				}
			}
			for (var row = i % this.size, rowend = row + (this.size * (this.size - 1)); row <= rowend; row += this.size) {
				if (row !== i) {
					indexObj[row] = true;
				}
			}
			if (this.areaSize) {
				for (
					var
						areaCol = Math.floor((i % this.size) / this.areaSize),
						areaRow = Math.floor(i / this.size / this.areaSize),
						field = (areaRow * this.size * this.areaSize) + (areaCol * this.areaSize),
						fieldend = field + (this.size * this.areaSize),
						fieldCol = 0;
					field < fieldend;
					fieldCol ++, field += fieldCol % this.areaSize === 0 ? this.size - this.areaSize + 1 : 1
				) {
					if (field !== i) {
						indexObj[field] = true;
					}
				}
			}

			indexCache[i] = [];
			for (var j = 0; j < this.length; j++) {
				if (indexObj[j]) {
					indexCache[i].push(j);
				}
			}

			indexCache[i] = new Uint8Array(indexCache[i]);

		}

		this.indexCache = indexCache;

	};

	/**
	 * get possible numbers
	 * @param integer index
	 */
	Sudoku.prototype.possibleNumbers = function(index) {

		var numbers = new Uint8Array(new ArrayBuffer(this.size)),
			length = this.indexCache[index].length,
			possibles,
			possiblesLength = this.size;

		for (var i = 0; i < this.size; i++) {
			numbers[i] = i + 1;
		}

		for (i = 0; i < length; i++) {
			if (this.fields[this.indexCache[index][i]] && numbers[this.fields[this.indexCache[index][i]] - 1]) {
				numbers[this.fields[this.indexCache[index][i]] - 1] = 0;
				possiblesLength--;
			}
		}

		possibles = new Uint8Array(new ArrayBuffer(possiblesLength));

		var j = 0;
		for (i = 0; i < this.size; i++) {
			if (numbers[i]) {
				possibles[j] = numbers[i];
				j++;
			}
		}

		return possibles;

	};

	/**
	 * shuffle array
	 * @param array o
	 */
	Sudoku.prototype.shuffle = function(o) {
		for(var j, x, i = o.length; i; j = parseInt(Math.random() * i, 10), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	};

	/**
	 * create an array like [1, 2, 3, ..., N]
	 * @param integer size
	 * @param integer start default 1
	 */
	Sudoku.prototype.range = function(size, start) {

		if (typeof start !== 'number') {
			start = 1;
		}

		var array = new Uint8Array(new ArrayBuffer(size));
		for (var i = 0; i < size; i++) {
			array[i] = i + start;
		}

		return array;

	};

	return Sudoku;
})();
