<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Item Table for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class TableEvent extends JTable
{
    public $id;
    public $scheduler_id;
    public $start;
    public $end;
    public $name;
    public $location;
    public $address_street;
    public $address_extra;
    public $zip;
    public $contact;
    public $email;
    public $phone;
    public $ada_confirmed;
    public $special_ballot_needed;
    public $special_ballot_worker_id;
    public $staffer1_id;
    public $staffer2_id;
    public $staffer3_id;
    public $precinct;
    public $lat;
    public $lng;
    public $published;
    public $created;
    public $updated;

    /**
     * Define our table, index
     * @param [type] &$_db [description]
     */
    public function __construct(&$_db)
    {
        parent::__construct('#__pv_demos_events', 'id', $_db);
    }

    /**
     * Validate before saving
     * @return boolean
     */
    public function check()
    {
        $error = 0;

        // we need something for field
/*        if (!$this->field) {
            $this->setError(JText::_('VALIDATION FIELD REQUIRED'));
            $error++;
        }
*/
        if ($error) {
            return false;
        }
        return true;
    }
}
