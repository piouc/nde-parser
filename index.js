const fs = require('fs')
const jconv = require('jconv')

// https://github.com/Daniel15/ndephp/wiki/NDEFormat

const types = [
	'Column',
	'Index',
	'Redirector',
	'String',
	'Integer',
	'Boolean',
	'Binary',
	'GUID',
	'Unknown',
	'Float',
	'Date and time',
	'Length'
]

const def = {
	filename: new Buffer(''),
	title: new Buffer(''),
	artist: new Buffer(''),
	album: new Buffer(''),
	year: new Buffer([0, 0, 0, 0]),
	trackno: new Buffer([0, 0, 0, 0]),
	length: new Buffer([0, 0, 0, 0]),
	disc: new Buffer([0, 0, 0, 0]),
	albumartist: new Buffer(''),
	tracks: new Buffer([0, 0, 0, 0]),
	discs: new Buffer([0, 0, 0, 0])
}

fs.readFile('./main.idx', (err, index) => {
	fs.readFile('./main.dat', (err, data) => {
		console.log('"NDEINDEX', get(index, 0, 8).toString())
		console.log('Number of records', get(index, 8, 4).readUInt32LE(0))

		const numberOfRecords = get(index, 8, 4).readUInt32LE(0)

		const columns = {}
		const res = []
		for(let i = 0; i < numberOfRecords; i++){
		// for(let i = 0; i < 1; i++){
			let offset = get(index, 16 + i * 8, 4).readUInt32LE(0)
			if(i === 0){
				while(offset !== 0){
					const header = get(data, offset, 14)
					const id = get(header, 0, 1).readUInt8(0)

					const	body = get(data, offset + 14, get(header, 2, 4).readUInt32LE(0))
					columns[id] = get(body, 3, get(body, 2, 1).readUInt8(0)).toString()

					offset = get(header, 6, 4).readUInt32LE(0)
				}
			} else if(i > 1){
				const b = {}
				while(offset !== 0){
					const header = get(data, offset, 14)
					const columnID = get(header, 0, 1).readUInt8(0)
					const type = get(header, 1, 1).readUInt8(0)
					const size = get(header, 2, 4).readUInt32LE(0)
					const body = get(data, offset + 14, get(header, 2, 4).readUInt32LE(0))
					if(columnID === 0){
						// console.log(columns[columnID])
						// console.log(body.toString())
						// console.log(body)
					}
					switch(type){
						case 4:
							b[columns[columnID]] = body
							break
						case 11:
							b[columns[columnID]] = body
							break
						default:
							b[columns[columnID]] = get(body, 2, get(body, 0, 2).readUInt16LE(0))
					}
					offset = get(header, 6, 4).readUInt32LE(0)
				}
				const a = Object.assign({}, def, b)
				res.push({
					filename: a['filename'].toString('ucs2'),
					title: a['title'].toString('ucs2'),
					artist: a['artist'].toString('ucs2'),
					album: a['album'].toString('ucs2'),
					year: a['year'].readUInt32LE(0),
					trackNo: a['trackno'].readUInt32LE(0),
					duration: a['length'].readUInt32LE(0),
					disc: a['disc'].readUInt32LE(0),
					albumArtist: a['albumartist'].toString('ucs2'),
					tracks: a['tracks'].readUInt32LE(0),
					discs: a['discs'].readUInt32LE(0)
				})
			}
		}
		fs.writeFile('/Users/piou/Desktop/main.json', JSON.stringify(res, null, '\t'), 'utf8', () => {})
	})
})

function get(buffer, offset, length){
	return buffer.slice(offset, offset + length)
}

function readString(buffer){
	return get
}