exports.getEstablishmentTypeOptions = (selectedItem) => {
  const items = []

  const establishmentTypes = require('../data/dist/schools/school-types')

  establishmentTypes.forEach((establishmentType, i) => {
    const item = {}

    item.text = establishmentType.name
    item.value = establishmentType.code
    item.id = establishmentType.id
    item.checked = (selectedItem && selectedItem.includes(establishmentType.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getEstablishmentTypeLabel = (code) => {
  const establishmentTypes = require('../data/dist/schools/school-types')
  const establishmentType = establishmentTypes.find(establishmentType => establishmentType.code === parseInt(code))

  let label

  if (establishmentType) {
    label = establishmentType.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getEstablishmentGroupOptions = (selectedItem) => {
  const items = []

  const establishmentGroups = require('../data/dist/schools/school-groups')

  establishmentGroups.forEach((establishmentGroup, i) => {
    const item = {}

    item.text = establishmentGroup.name
    item.value = establishmentGroup.code
    item.id = establishmentGroup.id
    item.checked = (selectedItem && selectedItem.includes(establishmentGroup.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getEstablishmentGroupLabel = (code) => {
  const establishmentGroups = require('../data/dist/schools/school-groups')
  const establishmentGroup = establishmentGroups.find(establishmentGroup => establishmentGroup.code === parseInt(code))

  let label

  if (establishmentGroup) {
    label = establishmentGroup.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getEstablishmentStatusOptions = (selectedItem) => {
  const items = []

  const establishementStatuses = require('../data/dist/schools/school-statuses')

  establishementStatuses.forEach((establishementStatus, i) => {
    const item = {}

    item.text = establishementStatus.name
    item.value = establishementStatus.code
    item.id = establishementStatus.id
    item.checked = (selectedItem && selectedItem.includes(establishementStatus.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getEstablishmentStatusLabel = (code) => {
  const establishementStatuses = require('../data/dist/schools/school-statuses')
  const establishementStatus = establishementStatuses.find(establishementStatus => establishementStatus.code === parseInt(code))

  let label

  if (establishementStatus) {
    label = establishementStatus.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getEstablishmentPhaseOptions = (selectedItem) => {
  const items = []

  const establishementPhases = require('../data/dist/schools/school-phases')

  establishementPhases.forEach((establishementPhase, i) => {
    const item = {}

    item.text = establishementPhase.name
    item.value = establishementPhase.code
    item.id = establishementPhase.id
    item.checked = (selectedItem && selectedItem.includes(establishementPhase.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getEstablishmentPhaseLabel = (code) => {
  const establishementPhases = require('../data/dist/schools/school-phases')
  const establishementPhase = establishementPhases.find(establishementPhase => establishementPhase.code === parseInt(code))

  let label

  if (establishementPhase) {
    label = establishementPhase.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getGenderOptions = (selectedItem) => {
  const items = []

  const genders = require('../data/dist/schools/school-genders')

  genders.forEach((gender, i) => {
    const item = {}

    item.text = gender.name
    item.value = gender.code
    item.id = gender.id
    item.checked = (selectedItem && selectedItem.includes(gender.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getGenderLabel = (code) => {
  const genders = require('../data/dist/schools/school-genders')
  const gender = genders.find(gender => gender.code === parseInt(code))

  let label

  if (gender) {
    label = gender.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getOfficialSixthFormOptions = (selectedItem) => {
  const items = []

  const sixthForms = require('../data/dist/schools/school-sixth-form')

  sixthForms.forEach((sixthForm, i) => {
    const item = {}

    item.text = sixthForm.name
    item.value = sixthForm.code
    item.id = sixthForm.id
    item.checked = (selectedItem && selectedItem.includes(sixthForm.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getOfficialSixthFormLabel = (code) => {
  const sixthForms = require('../data/dist/schools/school-sixth-form')
  const sixthForm = sixthForms.find(sixthForm => sixthForm.code === parseInt(code))

  let label

  if (sixthForm) {
    label = sixthForm.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getNurseryProvisionOptions = (selectedItem) => {
  const items = []

  const nurseryProvisions = require('../data/dist/schools/school-nursery-provision')

  nurseryProvisions.forEach((nurseryProvision, i) => {
    const item = {}

    item.text = nurseryProvision.name
    item.value = nurseryProvision.code
    item.id = nurseryProvision.id
    item.checked = (selectedItem && selectedItem.includes(nurseryProvision.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getNurseryProvisionLabel = (code) => {
  const nurseryProvisions = require('../data/dist/schools/school-nursery-provision')
  const nurseryProvision = nurseryProvisions.find(nurseryProvision => nurseryProvision.code === parseInt(code))

  let label

  if (nurseryProvision) {
    label = nurseryProvision.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getReligiousCharacterOptions = (selectedItem) => {
  const items = []

  const religiousCharacters = require('../data/dist/schools/school-religious-character')

  religiousCharacters.forEach((religiousCharacter, i) => {
    const item = {}

    item.text = religiousCharacter.name
    item.value = religiousCharacter.code
    item.id = religiousCharacter.id
    item.checked = (selectedItem && selectedItem.includes(religiousCharacter.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getReligiousCharacterLabel = (code) => {
  const religiousCharacters = require('../data/dist/schools/school-religious-character')
  const religiousCharacter = religiousCharacters.find(religiousCharacter => religiousCharacter.code === parseInt(code))

  let label

  if (religiousCharacter) {
    label = religiousCharacter.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getAdmissionsPolicyOptions = (selectedItem) => {
  const items = []

  const admissionsPolicies = require('../data/dist/schools/school-admissions-policy')

  admissionsPolicies.forEach((admissionsPolicy, i) => {
    const item = {}

    item.text = admissionsPolicy.name
    item.value = admissionsPolicy.code
    item.id = admissionsPolicy.id
    item.checked = (selectedItem && selectedItem.includes(admissionsPolicy.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getAdmissionsPolicyLabel = (code) => {
  const admissionsPolicies = require('../data/dist/schools/school-admissions-policy')
  const admissionsPolicy = admissionsPolicies.find(admissionsPolicy => admissionsPolicy.code === parseInt(code))

  let label

  if (admissionsPolicy) {
    label = admissionsPolicy.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getSpecialClassesOptions = () => { // selectedItem
  const items = []

  const options = require('../data/dist/schools/school-special-classes')

  options.forEach((option, i) => {
    const item = {}

    item.text = option.name
    item.value = option.code
    item.id = option.id
    // item.checked = (selectedItem && parseInt(selectedItem) === option.code) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getSpecialClassesLabel = (code) => {
  const options = require('../data/dist/schools/school-special-classes')
  const option = options.find(option => option.code === parseInt(code))

  let label

  if (option) {
    label = option.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getUrbanRuralOptions = (selectedItem) => {
  const items = []

  const options = require('../data/dist/schools/school-urban-rural')

  options.forEach((option, i) => {
    const item = {}

    item.text = option.name
    item.value = option.code
    item.id = option.id
    item.checked = (selectedItem && selectedItem.includes(option.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getUrbanRuralLabel = (code) => {
  const options = require('../data/dist/schools/school-urban-rural')
  const option = options.find(option => option.code === code)

  let label

  if (option) {
    label = option.name
  } else {
    label = 'Not entered'
  }

  return label
}

exports.getSENDProvisionOptions = (selectedItem, noneOption = false) => {
  const items = []

  const options = require('../data/dist/schools/school-send-provision')

  options.sort((a, b) => a.sortOrder - b.sortOrder)

  options.forEach((option, i) => {
    const item = {}

    item.text = option.name
    item.value = option.code
    item.id = option.id
    item.checked = (selectedItem && selectedItem.includes(option.code.toString())) ? 'checked' : ''

    items.push(item)
  })

  if (noneOption) {
    items.push({ divider: 'or' })
    items.push({
      text: 'None',
      value: 'none',
      id: '5df6cb03-028a-4374-8364-20eddbc789c8',
      checked: (selectedItem && selectedItem.includes('none')) ? 'checked' : '',
      behaviour: 'exclusive'
    })
  }

  // items.sort((a, b) => {
  //   return a.text.localeCompare(b.text)
  // })

  return items
}

exports.getSENDProvisionLabel = (code) => {
  const options = require('../data/dist/schools/school-send-provision')
  const option = options.find(option => option.code === parseInt(code))

  let label

  if (option) {
    label = option.name
  } else {
    label = 'Not entered'
  }

  return label
}
