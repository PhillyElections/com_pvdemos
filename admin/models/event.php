<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Event Model for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosModelEvent extends JModel
{
    /**
     * Constructor retrieves the ID from the request
     * @return    void
     */
    public function __construct()
    {
        parent::__construct();

        $array = JRequest::getVar('cid', 0, '', 'array');
        $id    = JRequest::getInt('id');
        if ($id) {
            // in case we're updating and check() failed
            $this->setId((int) $id);
        } else {
            $this->setId((int) $array[0]);
        }
    }

    /**
     * Set the active Event ID
     * @param int $id]
     * @return  void
     */
    public function setId($id)
    {
        // Set id and wipe data
        $this->_id   = $id;
        $this->_data = null;
    }

    /**
     * Get an event
     * @return object with data
     */
    public function &getData()
    {
        // Load the data
        if (empty($this->_data)) {
            $query = ' SELECT * from `#__pv_demos_events` where `id`=' . $this->_db->quote($this->_id);
            $this->_db->setQuery($query);
            $this->_data = $this->_db->loadObject();
        }
        if (!$this->_data) {
            $this->_data           = new stdClass();
            $this->_data->id       = 0;
        }

        return $this->_data;
    }

    /**
     * Method to store a record
     * @return    boolean
     */
    public function store($data)
    {
        $row = &$this->getTable();
        $dateNow = &JFactory::getDate();
        $dateIndex = $this->_id ? 'updated' : 'created';

        $data['start'] = date("Y-m-d H:i:s", strtotime($data['day'] . " " . $data['start_hour'] . ":" . $data['start_minute'] . ":" . "00"));
        $data['end'] = date("Y-m-d H:i:s", strtotime($data['day'] . " " . $data['end_hour'] . ":" . $data['end_minute'] . ":" . "00"));
dd($data);
        foreach ($data as $key => $value) {
            $data[$key] = JString::trim($value);
        }

        $data[$dateIndex] = $dateNow->toMySQL();

        // Bind the form fields to the Event table
        if (!$row->bind($data)) {
            $this->setError($this->_db->getErrorMsg());
            return false;
        }

        // Make sure the Event record is valid
        if (!$row->check()) {
            //$this->setError($this->_db->getErrorMsg());
            foreach ($row->getErrors() as $msg) {
                $this->setError($msg);
            }
            return false;
        }

        // Store the web link table to the database
        if (!$row->store()) {
            $this->setError($this->_db->getErrorMsg());
            return false;
        }

        return true;
    }

    /**
     * Delete record(s)
     * @return    boolean
     */
    public function delete()
    {
        $cids = JRequest::getVar('cid', array(0), 'post', 'array');

        $row = &$this->getTable();

        if (count($cids)) {
            foreach ($cids as $cid) {
                if (!$row->delete($cid)) {
                    $this->setError($row->getErrorMsg());
                    return false;
                }
            }
        }
        return true;
    }
}
