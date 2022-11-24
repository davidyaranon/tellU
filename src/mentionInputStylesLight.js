export default {
  color : "black",
  borderColor : "white",
  borderRadius : "10px",
  input: {
    borderRadius : "1px",
    overflow: 'auto',
    height : "125px",
    width: "80vw",
    border: "none",
    outline: "none",
    borderStyle: "none",
    borderColor: "Transparent",
  },
  highlighter: {
    borderRadius: "10px",
    borderColor : "white",
  },
  control: {
    borderRadius: "10px",
    backgroundColor: 'white',
    fontSize: 16,
    borderColor : "white",
    height : "120px",
    border : 0,
    outline: 0,
    width: "80vw",
    // fontWeight: 'normal',
  },
  suggestions: {
    borderRadius: "10px",
    list: {
      borderRadius: "10px",
      backgroundColor: '#d0d0d0',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 16,
    },
    item: {
      borderRadius : "10px",
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      '&focused': {
        backgroundColor: 'white',
      },
    },
  },
}