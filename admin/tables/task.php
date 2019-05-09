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
class TableTask extends JTable
{
    public $id;
    public $event_id;
    public $workers_ids;
    public $description;
    public $published;
    public $created;
    public $updated;

    /**
     * Define our table, index
     * @param [type] &$_db [description]
     */
    public function __construct(&$_db)
    {
        parent::__construct('#__pvdemos_staff', 'id', $_db);
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
