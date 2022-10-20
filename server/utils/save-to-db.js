function saveToDb(obj, collectionName) {
    const instance = new collectionName(obj);
    instance.save((err) => {
      if (err) {
        console.error("instance save error with ", obj, err);
        return true;
      }
    });
}

module.exports = saveToDb